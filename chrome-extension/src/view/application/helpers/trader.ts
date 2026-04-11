import { ItemOwned } from '../state/inventory'
import { ItemsMap } from '../state/items'
import { ItemData } from '../../../common/state'
import { getValueWithMarkup } from './items'
import { cloneSortList, SortItemData } from './inventory.sort'

// ─── Types ───────────────────────────────────────────────────────────────────

interface TraderStats {
    totalValue: number
    hiddenCount: number
}

interface AuctionStats {
    totalPed: number
    count: number
}

type MuSortMode = 'mu-ped' | 'total'

type DashboardSort =
    | { mode: 'standard', sortType: number }
    | { mode: MuSortMode, desc: boolean }

type ContainerGroup = [string, ItemOwned[]]

// ─── Stats ───────────────────────────────────────────────────────────────────

function calcTraderStats(items: ItemOwned[]): TraderStats {
    let totalValue = 0
    let hiddenCount = 0
    for (const item of items) {
        totalValue += parseFloat(item.data.v || '0')
        if (item.c.hidden.any) hiddenCount++
    }
    return { totalValue, hiddenCount }
}

function calcAuctionStats(items: ItemData[]): AuctionStats {
    let totalPed = 0
    for (const item of items) {
        totalPed += parseFloat(item.v || '0')
    }
    return { totalPed, count: items.length }
}

function calcTotalWithMarkup(items: ItemOwned[], itemsMap: ItemsMap): number {
    let total = 0
    for (const item of items) {
        const m = itemsMap[item.data.n]
        if (m?.markup?.value) {
            total += getValueWithMarkup(item.data.q, item.data.v, m)
        } else {
            total += parseFloat(item.data.v || '0')
        }
    }
    return total
}

// ─── Filtering ───────────────────────────────────────────────────────────────

function filterByText<T extends { n: string, c: string }>(items: T[], filter: string): T[] {
    if (!filter) return items
    const lower = filter.toLowerCase()
    return items.filter(item =>
        item.n.toLowerCase().includes(lower) || item.c.toLowerCase().includes(lower)
    )
}

function filterItemsByName<T extends { n: string }>(items: T[], filter: string): T[] {
    if (!filter) return items
    const lower = filter.toLowerCase()
    return items.filter(item => item.n.toLowerCase().includes(lower))
}

// ─── MU-aware sorting ────────────────────────────────────────────────────────
// Shared between HunterDashboard and TraderDashboard

function getMuValue(name: string, q: string, v: string, itemsMap: ItemsMap, mode: MuSortMode): number | null {
    const m = itemsMap[name]
    if (!m?.markup?.value) return null
    const raw = parseFloat(v || '0')
    const total = getValueWithMarkup(q, v, m)
    if (mode === 'mu-ped') return total - raw
    return total
}

function sortByMu<T extends SortItemData>(
    items: T[],
    itemsMap: ItemsMap,
    mode: MuSortMode,
    desc: boolean
): T[] {
    const list = [...items]
    list.sort((a, b) => {
        const va = getMuValue(a.n, a.q, a.v, itemsMap, mode)
        const vb = getMuValue(b.n, b.q, b.v, itemsMap, mode)
        if (va === null && vb === null) return a.n.localeCompare(b.n)
        if (va === null) return 1
        if (vb === null) return -1
        const d = Math.abs(va) - Math.abs(vb)
        if (d !== 0) return desc ? -d : d
        return desc ? -a.n.localeCompare(b.n) : a.n.localeCompare(b.n)
    })
    return list
}

function sortOwnedItems(
    items: ItemOwned[],
    sort: DashboardSort,
    itemsMap: ItemsMap
): ItemOwned[] {
    if (sort.mode === 'standard') {
        const sortedData = cloneSortList(items.map(i => i.data), sort.sortType)
        return sortedData
            .map(d => items.find(i => i.data.id === d.id || (i.data.n === d.n && i.data.c === d.c))!)
            .filter(Boolean)
    }
    const sortedData = sortByMu(
        items.map(i => i.data),
        itemsMap,
        sort.mode,
        sort.desc
    )
    return sortedData
        .map(d => items.find(i => i.data.id === d.id || (i.data.n === d.n && i.data.c === d.c))!)
        .filter(Boolean)
}

// ─── Container grouping ──────────────────────────────────────────────────────

function groupByContainer(items: ItemOwned[]): ContainerGroup[] {
    const groups: Record<string, ItemOwned[]> = {}
    for (const item of items) {
        const c = item.data.c || '(no container)'
        if (!groups[c]) groups[c] = []
        groups[c].push(item)
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
}

function calcGroupTotal(items: ItemOwned[]): number {
    return items.reduce((sum, item) => sum + parseFloat(item.data.v || '0'), 0)
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export {
    TraderStats,
    AuctionStats,
    MuSortMode,
    DashboardSort,
    ContainerGroup,
    calcTraderStats,
    calcAuctionStats,
    calcTotalWithMarkup,
    filterByText,
    filterItemsByName,
    getMuValue,
    sortByMu,
    sortOwnedItems,
    groupByContainer,
    calcGroupTotal,
}
