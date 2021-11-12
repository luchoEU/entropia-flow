import { Inventory, ItemData } from "../../../common/state"
import { ViewItemData } from "../state/history"

interface ItemSameNameData {
    q: number,
    v: number,
    c: string
}

interface SortableItemData {
    n: string,
    q: string,
    v: string,
    c: string
}

function sortList<T extends SortableItemData>(list: Array<T>): Array<T> {
    list.sort((a: T, b: T) => {
        // first by name
        const cn = a.n.localeCompare(b.n)
        if (cn !== 0)
            return cn

        // second by quantity
        const cq = Number(a.q) - Number(b.q)
        if (cq !== 0)
            return cq

        // third by value
        const cv = Number(a.v) - Number(b.v)
        if (cv !== 0)
            return cv

        // fourth by container
        return a.c.localeCompare(b.c)
    })
    return list
}

function compareSameName(a: ItemSameNameData, b: ItemSameNameData): number {
    // same order as sortList without the name
    const cq = a.q - b.q
    if (cq !== 0)
        return cq

    const cv = a.v - b.v
    if (cv !== 0)
        return cv

    return a.c.localeCompare(b.c)
}

function sortSameNameByContainer(list: Array<ItemSameNameData>) {
    list.sort((a: ItemSameNameData, b: ItemSameNameData) => {
        // first by container
        const cc = a.c.localeCompare(b.c)
        if (cc !== 0)
            return cc

        // second by quantity
        const cq = a.q - b.q
        if (cq !== 0)
            return cq

        // third by value
        return a.v - b.v
    })
}

const neg = (i: ItemData, key: number): ViewItemData => ({
    key,
    n: i.n,
    q: '-' + i.q,
    v: i.v === '0.00' ? '' : '-' + i.v,
    c: i.c
})

const pos = (i: ItemData, key: number): ViewItemData => ({
    key,
    n: i.n,
    q: i.q,
    v: i.v === '0.00' ? '' : i.v,
    c: i.c
})

function remainingInPrevious(iList: Array<ItemData>, pList: Array<ItemData>, n: number, m: number, key: number): PatternMatcherResult {
    if (n === iList.length) {
        return {
            newItems: [neg(pList[m], key)],
            nInc: 0,
            mInc: 1,
        }
    }
    return undefined
}

function remainingInInventory(iList: Array<ItemData>, pList: Array<ItemData>, n: number, m: number, key: number): PatternMatcherResult {
    if (m === pList.length) {
        return {
            newItems: [pos(iList[n], key)],
            nInc: 1,
            mInc: 0,
        }
    }
    return undefined
}

function ignoreSame(iList: Array<ItemData>, pList: Array<ItemData>, n: number, m: number, key: number): PatternMatcherResult {
    const i = iList[n]
    const p = pList[m]
    if (i.n === p.n && i.q === p.q && i.v === p.v && i.c === p.c) {
        return {
            newItems: undefined,
            nInc: 1,
            mInc: 1
        }
    }
    return undefined
}

type AddFunc = (q: number, v: number, c: string) => void
const sameName = {
    removeSame: (iList: Array<ItemSameNameData>, pList: Array<ItemSameNameData>) => {
        let n = 0
        let m = 0
        while (n < iList.length && m < pList.length) {
            const c = compareSameName(iList[n], pList[m])
            if (c === 0) {
                iList.splice(n, 1)
                pList.splice(m, 1)
            } else if (c < 0) {
                n++
            } else { // c > 0
                m++
            }
        }
    },
    moveSameValue: (add: AddFunc, iList: Array<ItemSameNameData>, pList: Array<ItemSameNameData>) => {
        // before sortSameNameByContainer
        let n = 0
        let m = 0
        while (n < iList.length && m < pList.length) {
            const i = iList[n]
            const p = pList[m]
            let c = i.q - p.q
            if (c === 0)
                c = i.v - p.v
            if (c === 0) {
                add(i.q, i.v, `${p.c} ⭢ ${i.c}`)
                iList.splice(n, 1)
                pList.splice(m, 1)
            } else if (c < 0) {
                n++
            } else { // c > 0
                m++
            }
        }
    },
    movePart: (add: AddFunc, iList: Array<ItemSameNameData>, pList: Array<ItemSameNameData>, reverse: boolean) => {
        // after sortSameNameByContainer
        if (iList.length > 1 && pList.length > 0) {
            const i = iList[0]
            const i2 = iList[1]
            const p = pList[0]
            if (i2.c == p.c
                && i.q + i2.q - p.q === 0
                && Math.abs(i.v + i2.v - p.v) < 0.01) {
                const c = reverse ? `${i.c} ⭢ ${i2.c}` : `${i2.c} ⭢ ${i.c}`
                add(i.q, i.v, c)
                iList.splice(0, 2)
                pList.splice(0, 1)
            }
        }
    },
    moveSameContainer: (add: AddFunc, iList: Array<ItemSameNameData>, pList: Array<ItemSameNameData>) => {
        // after sortSameNameByContainer
        let n = 0
        let m = 0
        while (n < iList.length && m < pList.length) {
            const i = iList[n]
            const p = pList[m]
            const c = i.c.localeCompare(p.c)
            if (c === 0) {
                add(i.q - p.q, i.v - p.v, i.c)
                iList.splice(n, 1)
                pList.splice(m, 1)
            } else if (c < 0) {
                n++
            } else { // c > 0
                m++
            }
        }
    },
    addRemaining: (add: AddFunc, list: Array<ItemSameNameData>, mult: number) => {
        for (let i of list)
            add(i.q * mult, i.v * mult, i.c)
    },
    areSameContainers: (iList: Array<ItemSameNameData>, pList: Array<ItemSameNameData>): Boolean => {
        if (iList.length !== pList.length)
            return false

        const iC = iList.map(v => v.c).sort()
        const pC = pList.map(v => v.c).sort()
        return iC.every((value, index) => value === pC[index])
    },
    add: (items: Array<ViewItemData>, name: string) => (q: number, v: number, c: string) => {
        // creates add function that will be used in the other methods
        items.push({
            key: 0,
            n: name,
            q: q === 0 ? '' : q.toString(),
            v: v === 0 ? '' : c.includes('⭢') ? `(${v.toFixed(2)})` : v.toFixed(2),
            c: c
        })
    },
    addKeys: (items: Array<ViewItemData>, key: number) => {
        for (let item of items)
            item.key = key++
    },
    getDifference: (name: string, iList: Array<ItemSameNameData>, pList: Array<ItemSameNameData>, key: number): Array<ViewItemData> => {
        sameName.removeSame(iList, pList)
        const items = []
        const addFunc = sameName.add(items, name)
        if (!sameName.areSameContainers(iList, pList))
            sameName.moveSameValue(addFunc, iList, pList)
        sortSameNameByContainer(iList)
        sortSameNameByContainer(pList)
        sameName.movePart(addFunc, iList, pList, false)
        sameName.movePart(addFunc, pList, iList, true)
        sameName.moveSameContainer(addFunc, iList, pList)
        sameName.addRemaining(addFunc, iList, 1)
        sameName.addRemaining(addFunc, pList, -1)
        sortList(items)
        sameName.addKeys(items, key)
        return items
    },
    getArray: (name: string, start: number, list: Array<ItemData>): { inc: number, newList: Array<ItemSameNameData> } => {
        const newList = []
        let index = start
        while (index < list.length
            && name == list[index].n) {
            newList.push({
                q: Number(list[index].q),
                v: Number(list[index].v),
                c: list[index].c
            })
            index++
        }
        return { inc: index - start, newList }
    }
}

function sameNameMulti(iList: Array<ItemData>, pList: Array<ItemData>, n: number, m: number, key: number): PatternMatcherResult {
    const i = iList[n]
    const p = pList[m]
    if (i.n === p.n
        && ((n + 1 < iList.length && i.n === iList[n + 1].n)
            || (m + 1 < pList.length && i.n === pList[m + 1].n))) {
        const iName = sameName.getArray(i.n, n, iList)
        const pName = sameName.getArray(p.n, m, pList)
        const newItems = sameName.getDifference(i.n, iName.newList, pName.newList, key)
        return {
            newItems,
            nInc: iName.inc,
            mInc: pName.inc
        }
    }
}

function sameNameSingle(iList: Array<ItemData>, pList: Array<ItemData>, n: number, m: number, key: number): PatternMatcherResult {
    const i = iList[n]
    const p = pList[m]
    if (i.n === p.n) {
        let quantity = (Number(i.q) - Number(p.q)).toString()
        if (quantity === '0')
            quantity = ''

        let value = (Number(i.v) - Number(p.v)).toFixed(2)
        if (value === '0.00')
            value = ''

        let container = i.c
        if (i.c !== p.c) {
            if (quantity === '' && value === '') {
                container = `${p.c} ⭢ ${i.c}`
                quantity = i.q
                value = `(${i.v})`
            } else {
                container = `${p.c} ⟹ ${i.c}`
            }
        }

        return {
            newItems: [{
                key,
                n: i.n,
                q: quantity,
                v: value,
                c: container
            }],
            nInc: 1,
            mInc: 1
        }
    }
    return undefined
}

function differentNameInventoryFirst(iList: Array<ItemData>, pList: Array<ItemData>, n: number, m: number, key: number): PatternMatcherResult {
    const i = iList[n]
    const p = pList[m]
    if (i.n.localeCompare(p.n) < 0) {
        return {
            newItems: [pos(i, key)],
            nInc: 1,
            mInc: 0
        }
    }
    return undefined
}

function differentNamePreviousFirst(iList: Array<ItemData>, pList: Array<ItemData>, n: number, m: number, key: number): PatternMatcherResult {
    const i = iList[n]
    const p = pList[m]
    if (i.n.localeCompare(p.n) > 0) {
        return {
            newItems: [neg(p, key)],
            nInc: 0,
            mInc: 1
        }
    }
    return undefined
}

type PatternMatcherResult = { newItems: Array<ViewItemData>, nInc: number, mInc: number }
type PatternMatcher = (iList: Array<ItemData>, pList: Array<ItemData>, n: number, m: number, key: number) => PatternMatcherResult

const patterns: Array<PatternMatcher> = [
    remainingInPrevious,
    remainingInInventory,
    ignoreSame,
    sameNameMulti,
    sameNameSingle,
    differentNameInventoryFirst,
    differentNamePreviousFirst
]

function getDifference(inventory: Inventory, previous: Inventory): Array<ViewItemData> {
    if (previous === undefined || inventory.itemlist === undefined || previous.itemlist === undefined)
        return null

    const iList = sortList(inventory.itemlist)
    const pList = sortList(previous.itemlist)

    const diff = []
    let n = 0
    let m = 0
    while (n < inventory.itemlist.length || m < previous.itemlist.length) {
        let match: PatternMatcherResult = undefined
        for (let matcher of patterns) {
            match = matcher(iList, pList, n, m, diff.length)
            if (match !== undefined)
                break
        }
        if (match === undefined)
            break
        if (match.newItems !== undefined) {
            diff.push.apply(diff, match.newItems)
        }
        n += match.nInc
        m += match.mInc
    }

    if (diff.length === 0)
        return null
    else
        return diff
}

function getValue(item: ViewItemData): number {
    if (item.c.includes('⭢'))
        return 0
    else
        return Number(item.v)
}

function hasValue(item: ViewItemData): boolean {
    return getValue(item) !== 0
}

export {
    getDifference,
    getValue,
    hasValue
}