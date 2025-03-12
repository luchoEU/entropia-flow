interface TradeState {
    lastMessageCheckTime: number
    notifications: TradeNotification[]
}

interface TradeNotification {
    time: string
    filter: string
}

export {
    TradeState
}
