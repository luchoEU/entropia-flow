interface LootLogData {
    material: string
    amount: number
    value: number
}

interface TeamItemLogData {
    player: string
    item: string
}

interface TeamSharedLogData {
    player: string
    material: string
    amount: number
}

export {
    LootLogData,
    TeamItemLogData,
    TeamSharedLogData
}