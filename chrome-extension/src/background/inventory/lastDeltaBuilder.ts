import { matchDate } from "../../common/date"
import { Inventory } from "../../common/state"
import { getDifference, getValue, hasValue } from "../../view/application/helpers/diff"
import { getLatestFromInventoryList } from "../../view/application/helpers/history"
import { sortList } from "../../view/application/helpers/inventory.sort"
import { getValueWithMarkup } from "../../view/application/helpers/items"
import { ViewItemData } from "../../view/application/state/history"
import { ItemsMap, ItemsState } from "../../view/application/state/items"
import { LastRequiredState, ViewPedData } from "../../view/application/state/last"
import AppStorage from "../../view/services/api/storage"
import ViewSettings from "../settings/viewSettings"
import InventoryManager from "../inventory/inventory"
import { StreamStateVariable } from "../../stream/data"

class LastDeltaBuilder implements StreamVariablesBuilder {
    private viewSettings: ViewSettings
    private inventoryManager: InventoryManager
    private lastDiff: Array<ViewItemData> = []
    private stateLast: LastRequiredState | undefined
    private stateItems: ItemsState | undefined    
    
    constructor(viewSettings: ViewSettings, inventoryManager: InventoryManager) {
        this.viewSettings = viewSettings
        this.inventoryManager = inventoryManager
    }

    public async updateState() {
        this.stateLast = await AppStorage.loadLast()
        this.stateItems = await AppStorage.loadItems()
    }

    private async calculateDelta(list: Array<Inventory>, last: number) {
        let date: number
        let diff: Array<ViewItemData> | undefined
        const inv = _findInventory(list, last)
        if (inv === null) {
            date = 0
            diff = this.lastDiff
        } else {
            date = last
            const lastInv: Inventory = getLatestFromInventoryList(list)
            if (inv === lastInv) { // it is the most recent valid inventory in history
                diff = null!
            } else {
                diff = getDifference(lastInv, inv)
                if (diff) {
                    _applyExcludes(0, diff, this.lastDiff)
                    if (this.stateLast) {
                        _applyPermanentExclude(0, diff, this.stateLast?.permanentBlacklist)
                        _applyWarning(diff, this.stateLast?.blacklist)
                        sortList(diff, this.stateLast?.sortType)
                    }
                    this.lastDiff = diff
                } else {
                    diff = this.lastDiff
                }
            }
        }

        const deltaPeds = _pedSum(this.stateLast?.peds ?? [])
        const deltaNoMarkup = _sumDiff(diff, {}) + deltaPeds
        const deltaWithMarkup = _sumDiff(diff, this.stateItems?.map ?? {}) + deltaPeds
        return {
            date,
            diff,
            delta: this.stateLast?.showMarkup ? deltaWithMarkup : deltaNoMarkup,
            deltaNoMarkup,
            deltaWithMarkup
        }
    }

    public getName(): string {
        return 'last'
    }

    public async getVariables(): Promise<StreamStateVariable[]> {
        const { delta, deltaNoMarkup, deltaWithMarkup, diff } = await this.calculateDelta(await this.inventoryManager.getList(), await this.viewSettings.getLast())
        return _getLastVariables(delta, deltaNoMarkup, deltaWithMarkup, diff)
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

function _applyExcludes(d: number, diff: Array<ViewItemData> | undefined, last: Array<ViewItemData> | undefined): number {
    // transfer excluded from previous list
    if (last) {
        for (const item of last) {
            if (item.e) {
                const i = diff?.find(i => {
                    return !i.e
                        && i.n === item.n
                        && i.q === item.q
                        && i.v === item.v
                        && i.c === item.c
                })
                if (i !== undefined) {
                    i.e = true
                    d -= getValue(i)
                }
            }
        }
    }
    // mark auction sells as excluded, unless they are all auction changes
    if (diff?.find(i => i.c !== 'AUCTION')) {
        for (const item of diff) {
            if (item.c === 'AUCTION' && Number(item.q) < 0) { // < 0 are sells
                const existed = last && last.find(i => {
                    return i.n === item.n
                        && i.q === item.q
                        && i.v === item.v
                        && i.c === item.c
                })
                if (!existed) {
                    item.e = true
                    d -= getValue(item)
                }
            }
        }
    }
    return d
}

function _applyPermanentExclude(d: number, diff: Array<ViewItemData>, permanentBlacklist: Array<string>): number {
    diff.forEach(item => {
        if (hasValue(item) && permanentBlacklist.includes(item.n)) {
            item.x = true
            if (!item.e) {
                item.e = true
                d -= getValue(item)
            }
        }
    })
    return d
}

function _applyWarning(diff: Array<ViewItemData> | undefined, blacklist: Array<string>) {
    diff?.forEach(item => item.w = !item.e && hasValue(item) && blacklist.includes(item.n))
}

const _pedSum = (peds: Array<ViewPedData>) => peds.reduce((p, c) => p + Number(c.value), 0)

const _sumDiff = (diff: ViewItemData[] | undefined, items: ItemsMap): number =>
    diff?.reduce((p, c) => p + (c.e ? 0 : getValueWithMarkup(c.q, c.v, items[c.n])), 0) ?? 0;

export { LastDeltaBuilder, _getLastVariables, _findInventory, _applyExcludes, _applyPermanentExclude, _applyWarning, _pedSum, _sumDiff }
