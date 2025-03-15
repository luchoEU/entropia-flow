interface TradeState {
    lastMessageCheckSerial: number
    notifications: TradeNotification[]
}

interface TradeNotification {
    time: string
    filter: string
}

export {
    TradeState
}
