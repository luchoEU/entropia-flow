/// <reference types="chrome"/>

/**
 * Service to enable communication between multiple instances of the same extension.
 * Uses chrome.storage.local as a shared pub-sub system.
 */

interface InstanceEvent {
    id: string                      // Unique event ID
    sourceInstanceId: string        // Which instance triggered this
    actionName: string              // What action to perform
    payload: any                    // Action data
    timestamp: number               // When it was created
}

interface InstanceResult {
    eventId: string                 // Links to the InstanceEvent
    sourceInstanceId: string        // Which instance is reporting result
    data: any                       // The result data
    timestamp: number
}

type EventHandler = (event: InstanceEvent) => Promise<any>

class SharedInstanceService {
    private instanceId: string
    private handlers: Map<string, EventHandler[]> = new Map()
    private listeningForChanges = false

    constructor() {
        this.instanceId = this.generateInstanceId()
    }

    private generateInstanceId(): string {
        return `instance_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    }

    public getInstanceId(): string {
        return this.instanceId
    }

    /**
     * Register to listen for a specific action across all instances
     */
    public onAction(actionName: string, handler: EventHandler): void {
        if (!this.handlers.has(actionName)) {
            this.handlers.set(actionName, [])
        }
        this.handlers.get(actionName)!.push(handler)

        // Start listening for storage changes on first handler
        if (!this.listeningForChanges) {
            this.startListening()
        }
    }

    /**
     * Trigger an action that all instances should execute
     */
    public async publishAction(actionName: string, payload: any = {}): Promise<InstanceResult[]> {
        const event: InstanceEvent = {
            id: this.generateEventId(),
            sourceInstanceId: this.instanceId,
            actionName,
            payload,
            timestamp: Date.now()
        }

        // Store the event
        const storageKey = `action_${event.id}`
        await chrome.storage.local.set({
            [storageKey]: event,
            'lastAction': event.id // Track the last action for quick lookup
        })

        // Execute locally
        const localResult = await this.executeAction(event)

        // Wait a bit for other instances to process
        const otherResults = await new Promise<InstanceResult[]>((resolve) => {
            const timeout = setTimeout(() => {
                resolve([])
            }, 1000) // Give other instances 1 second to respond

            const onStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
                const results: InstanceResult[] = []
                for (const key in changes) {
                    if (key.startsWith(`result_${event.id}_`)) {
                        const result = changes[key].newValue as InstanceResult
                        if (result.sourceInstanceId !== this.instanceId) {
                            results.push(result)
                        }
                    }
                }
                if (results.length > 0) {
                    chrome.storage.onChanged.removeListener(onStorageChange)
                    clearTimeout(timeout)
                    resolve(results)
                }
            }

            chrome.storage.onChanged.addListener(onStorageChange)
        })

        return localResult ? [localResult, ...otherResults] : otherResults
    }

    /**
     * Store a result for an action
     */
    public async publishResult(eventId: string, data: any): Promise<void> {
        const result: InstanceResult = {
            eventId,
            sourceInstanceId: this.instanceId,
            data,
            timestamp: Date.now()
        }

        const storageKey = `result_${eventId}_${this.instanceId}`
        await chrome.storage.local.set({
            [storageKey]: result
        })
    }

    private generateEventId(): string {
        return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    }

    private startListening(): void {
        if (this.listeningForChanges) return

        this.listeningForChanges = true

        chrome.storage.onChanged.addListener((changes, areaName) => {
            if (areaName !== 'local') return

            // Check for new actions
            for (const key in changes) {
                if (key.startsWith('action_')) {
                    const change = changes[key]
                    if (change.newValue) {
                        const event = change.newValue as InstanceEvent

                        // Don't re-execute our own actions
                        if (event.sourceInstanceId !== this.instanceId) {
                            this.executeAction(event)
                        }
                    }
                }
            }
        })
    }

    private async executeAction(event: InstanceEvent): Promise<InstanceResult | null> {
        const handlers = this.handlers.get(event.actionName)
        if (!handlers || handlers.length === 0) {
            return null
        }

        try {
            const results = await Promise.all(handlers.map(h => h(event)))
            const result = results.length === 1 ? results[0] : results

            // Store result
            await this.publishResult(event.id, result)

            return {
                eventId: event.id,
                sourceInstanceId: this.instanceId,
                data: result,
                timestamp: Date.now()
            }
        } catch (error) {
            console.error(`Error executing action ${event.actionName}:`, error)
            return null
        }
    }
}

export default SharedInstanceService
