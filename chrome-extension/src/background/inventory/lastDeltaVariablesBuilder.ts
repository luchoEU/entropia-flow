import { matchDate } from "../../common/date"
import { Inventory } from "../../common/state"
import { getLatestFromInventoryList } from "../../view/application/helpers/history"
import { ViewItemData } from "../../view/application/state/history"
import ViewSettings from "../settings/viewSettings"
import InventoryManager from "../inventory/inventory"
import { StreamStateVariable } from "../../stream/data"
import { StreamBuilderState, StreamVariablesBuilder } from "../client/streamVariablesBuilder"
import { calculateInventoryDelta, _sumDiff } from "../../view/application/helpers/lastDelta"

class LastDeltaVariablesBuilder implements StreamVariablesBuilder {
    private viewSettings: ViewSettings
    private inventoryManager: InventoryManager
    private lastDiff: Array<ViewItemData> = []
    public onChanged?: () => Promise<void>
    
    constructor(viewSettings: ViewSettings, inventoryManager: InventoryManager) {
        this.viewSettings = viewSettings
        this.viewSettings.onChanged = async () => await this.onChanged?.()
        this.inventoryManager = inventoryManager
        this.inventoryManager.subscribeOnChanged(async () => await this.onChanged?.())
    }

    public getName(): string {
        return 'last'
    }

    private async calculateDelta(state: StreamBuilderState, invList: Array<Inventory>, last: number) {
        let date: number
        let diff: Array<ViewItemData> | null
        let deltaNoMarkup: number
        let deltaWithMarkup: number

        const list = [...invList]
        list.reverse() // newer first
        const inv = _findInventory(list, last)

        if (inv === null) {
            // No matching inventory found
            date = 0
            diff = this.lastDiff
            const lastDiffToUse = (this.lastDiff ?? undefined) as ViewItemData[] | undefined
            deltaNoMarkup = _sumDiff(lastDiffToUse, {})
            deltaWithMarkup = _sumDiff(lastDiffToUse, state.items?.map ?? {})
        } else {
            date = last
            const lastInv: Inventory = getLatestFromInventoryList(list)
            if (inv === lastInv) {
                // Most recent inventory - no diff
                diff = null!
                deltaNoMarkup = 0
                deltaWithMarkup = 0
            } else {
                // Use shared calculation function
                const result = calculateInventoryDelta({
                    lastInv,
                    inv,
                    previousDiff: state.last?.c.diff,
                    blacklist: state.last?.blacklist ?? [],
                    permanentBlacklist: state.last?.permanentBlacklist ?? [],
                    sortType: state.last?.sortType ?? 0,
                    peds: state.last?.peds ?? [],
                    itemsMap: state.items?.map ?? {}
                })
                diff = result.diff
                deltaNoMarkup = result.deltaNoMarkup
                deltaWithMarkup = result.deltaWithMarkup
                this.lastDiff = diff
            }
        }

        return {
            date,
            diff,
            delta: state.last?.showMarkup ? deltaWithMarkup : deltaNoMarkup,
            deltaNoMarkup,
            deltaWithMarkup
        }
    }

    public async getVariables(state: StreamBuilderState): Promise<StreamStateVariable[]> {
        const { delta, deltaNoMarkup, deltaWithMarkup, diff } = await this.calculateDelta(state, await this.inventoryManager.getList(), await this.viewSettings.getLast())
        return _getLastVariables(delta, deltaNoMarkup, deltaWithMarkup, diff ?? undefined)
    }
}

function _getLastVariables(delta: number | undefined, deltaNoMarkup: number | undefined, deltaWithMarkup: number | undefined, diff: Array<ViewItemData> | undefined) {
    return [
        { name: 'delta', value: (delta || 0).toFixed(2) },
        { name: 'deltaNoMarkup', value: (deltaNoMarkup || 0).toFixed(2) },
        { name: 'deltaWithMarkup', value: (deltaWithMarkup || 0).toFixed(2) },
        { name: 'deltaBackColor', value: "=IF(delta > 0, 'green', delta < 0, 'red', 'black')", description: 'delta background color' },
        { name: 'deltaWord', value: "=IF(delta > 0, 'Profit', delta < 0, 'Loss')", description: 'delta word' },
        { name: 'deltaItems', value: diff?.filter(d => !d.e).map(d => ({ name: d.n, quantity: Number(d.q), value: Number(d.v), container: d.c })) ?? [], description: 'delta items' }
    ]
}

function _findInventory(list: Array<Inventory>, lastRefresh: number) {
    if (lastRefresh === undefined)
        return null

    for (let inv of list) {
        if (matchDate(inv, lastRefresh))
            return inv
    }
    return list[0]
}

export { LastDeltaVariablesBuilder, _findInventory }
