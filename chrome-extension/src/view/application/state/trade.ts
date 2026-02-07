interface TradeState {
    lastMessageCheckSerial: number
    notifications: TradeNotification[]
}

interface TradeNotification {
    time: string
    filter: string
}

const initialState: TradeState = {
    lastMessageCheckSerial: 0,
    notifications: []
}

export {
    TradeState,
    initialState
}
