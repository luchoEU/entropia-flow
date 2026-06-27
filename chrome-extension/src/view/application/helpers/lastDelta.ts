import { getDifference, getValue, hasValue } from './diff'
import { sortList } from './inventory.sort'
import { getValueWithMarkup } from './items'
import { ViewItemData } from '../state/history'
import { ItemsMap } from '../state/items'
import { ViewPedData } from '../state/last'
import { Inventory } from '../../../common/state'

export interface CalculateDeltaParams {
    lastInv: Inventory
    inv: Inventory
    previousDiff?: Array<ViewItemData>
    blacklist: Array<string>
    permanentBlacklist: Array<string>
    sortType: number
    peds: Array<ViewPedData>
    itemsMap: ItemsMap
}

export interface CalculateDeltaResult {
    diff: Array<ViewItemData> | null
    deltaNoMarkup: number
    deltaWithMarkup: number
}

export function _applyExcludes(d: number, diff: Array<ViewItemData> | undefined, last: Array<ViewItemData> | undefined): number {
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

export function _applyBlacklist(d: number, diff: Array<ViewItemData> | undefined, blacklist: Array<string>): number {
    diff?.forEach(item => {
        if (hasValue(item)) {
            if (blacklist.includes(item.n)) {
                if (!item.e) {
                    item.e = true
                    d -= getValue(item)
                }
            } else {
                if (item.e && !item.x) {
                    item.e = false
                    d += getValue(item)
                }
            }
        }
    })
    return d
}

export function _applyPermanentExclude(d: number, diff: Array<ViewItemData>, permanentBlacklist: Array<string>): number {
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

export function _applyWarning(diff: Array<ViewItemData> | undefined, blacklist: Array<string>) {
    diff?.forEach(item => item.w = !item.e && hasValue(item) && blacklist.includes(item.n))
}

export const _pedSum = (peds: Array<ViewPedData>) => peds.reduce((p, c) => p + Number(c.value), 0)

export const _sumDiff = (diff: ViewItemData[] | undefined, items: ItemsMap): number =>
    diff?.reduce((p, c) => p + (c.e ? 0 : getValueWithMarkup(c.q, c.v, items[c.n])), 0) ?? 0

/**
 * Unified delta calculation function
 * Calculates the profit/loss delta between two inventories
 * Applies all exclusion rules and returns both markup and no-markup variants
 */
export function calculateInventoryDelta(params: CalculateDeltaParams): CalculateDeltaResult {
    const { lastInv, inv, previousDiff, blacklist, permanentBlacklist, sortType, peds, itemsMap } = params

    const diff = getDifference(lastInv, inv)
    if (diff) {
        // Apply exclusions (these mark items in-place with item.e = true)
        _applyExcludes(0, diff, previousDiff)
        _applyBlacklist(0, diff, blacklist)
        _applyPermanentExclude(0, diff, permanentBlacklist)
        _applyWarning(diff, blacklist)
        sortList(diff, sortType)
    }

    // Calculate both variants
    const deltaPeds = _pedSum(peds)
    const deltaNoMarkup = _sumDiff(diff ?? undefined, {}) + deltaPeds
    const deltaWithMarkup = _sumDiff(diff ?? undefined, itemsMap) + deltaPeds

    return {
        diff,
        deltaNoMarkup,
        deltaWithMarkup
    }
}
