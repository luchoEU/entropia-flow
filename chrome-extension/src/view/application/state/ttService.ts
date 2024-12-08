interface TTServiceState {
    loading: boolean
    inventory: Array<TTServiceItem>
    c?: {
        itemInventoryValue: {[name: string]: number}
    }
}

interface TTServiceItem {
    date: string
    player: string
    name: string
    quantity: number
    value: number
}

export {
    TTServiceState,
    TTServiceItem
}