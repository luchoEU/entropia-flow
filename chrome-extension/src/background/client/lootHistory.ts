//// Loot HISTORY ////
// Keep the loot history of changes taken from game log

import { LootLogData } from "./logData"

class LootHistory {
    public list: Array<LootLogData>
    public onChange: (gameLog: Array<LootLogData>) => void

    public onLoot(d: LootLogData) {
        this.list.push(d)
        if (this.onChange)
            this.onChange(this.list)
    }
}

export default LootHistory