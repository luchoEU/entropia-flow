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
        this.startListening()
    }

    /**
     * Trigger an action that all instances should execute
     */
    public async publishAction(actionName: string, payload: any = {}): Promise<void> {
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
            [storageKey]: event
        })

        // Execute locally
        await this.executeAction(event)

        // Clean up after 5 seconds
        setTimeout(() => {
            chrome.storage.local.remove(storageKey)
        }, 5000)
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

    private async executeAction(event: InstanceEvent): Promise<void> {
        const handlers = this.handlers.get(event.actionName)
        if (!handlers || handlers.length === 0) {
            return
        }

        try {
            await Promise.all(handlers.map(h => h(event)))
        } catch (error) {
            console.error(`Error executing action ${event.actionName}:`, error)
        }
    }
}

export default SharedInstanceService
