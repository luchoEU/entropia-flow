export type RpcHandler = (payload?: any) => Promise<any> | any

const CHANNEL = "entropia-flow-content-script:v1"

type Message =
    | { channel: string; type: "WHO_IS_LEADER" }
    | { channel: string; type: "I_AM_LEADER" }
    | { channel: string; type: "REQUEST"; name: string; payload?: any }
    | { channel: string; type: "RESPONSE"; name: string; payload?: any }
    | { channel: string; type: "BROADCAST"; name: string; payload?: any }

export class LeaderBridge {
    private isLeader = true
    private handlers: Record<string, RpcHandler> = {}
    private broadcastHandlers: Record<string, RpcHandler> = {}

    constructor() {
        this.listen()
    }

    // ==============================
    // Public API
    // ==============================

    register(name: string, handler: RpcHandler) {
        this.handlers[name] = handler
    }

    registerBroadcast(name: string, handler: RpcHandler) {
        this.broadcastHandlers[name] = handler
    }

    async call(name: string, payload?: any): Promise<any> {
        if (this.isLeader) {
            return this.handlers[name]?.(payload)
        }

        return new Promise((resolve) => {
            const listener = (event: MessageEvent) => {
                if (event.source !== window) return
                const msg = event.data
                if (msg?.channel !== CHANNEL) return
                if (msg.type !== "RESPONSE") return
                if (msg.name !== name) return

                window.removeEventListener("message", listener)
                resolve(msg.payload)
            }

            window.addEventListener("message", listener)

            window.postMessage(
                { channel: CHANNEL, type: "REQUEST", name, payload },
                "*"
            )
        })
    }

    isLeaderInstance() {
        return this.isLeader
    }

    broadcast(name: string, payload?: any) {
        window.postMessage(
            { channel: CHANNEL, type: "BROADCAST", name, payload },
            "*"
        )
    }

    private listen() {
        window.addEventListener("message", async (event) => {
            if (event.source !== window) return
            const msg = event.data
            if (msg?.channel !== CHANNEL) return

            if (msg.type === "REQUEST" && this.isLeader) {
                const handler = this.handlers[msg.name]
                if (!handler) return

                const result = await handler(msg.payload)

                window.postMessage(
                    {
                        channel: CHANNEL,
                        type: "RESPONSE",
                        name: msg.name,
                        payload: result
                    },
                    "*"
                )
            }

            if (msg.type === "BROADCAST") {
                const handler = this.broadcastHandlers[msg.name] ?? this.broadcastHandlers["*"]
                if (handler) {
                    await handler({ name: msg.name, ...msg.payload })
                }
            }
        })
    }
}
