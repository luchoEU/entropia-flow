import { SortSecuence } from "../state/sort"

const stringComparer = (a: string, b: string) => a.localeCompare(b)
const numberComparer = (a: number, b: number) => a - b

interface SortColumnDefinition<I, T = any> {
    selector: (item: I) => T,
    comparer: (a: T, b: T) => number,
}

function cloneAndSort<I extends any>(list: Array<I>, sortInfo: SortSecuence, sortColumnDefinition: Array<SortColumnDefinition<I>>): Array<I> {
    if (!sortInfo) return list

    const newList = [...list]
    newList.sort((a: I, b: I) => {
      for (const s of sortInfo)
      {
        const def = sortColumnDefinition[s.column]
        const res = def.comparer(def.selector(a), def.selector(b))
        if (res !== 0)
          return res * (s.ascending ? 1 : -1)
      }
      return 0;
    })
    return newList
}

function nextSortSecuence(column: number, sortInfo: SortSecuence): SortSecuence {
  if (!sortInfo)
    return [ { column, ascending: true } ]

  let ascending = sortInfo.find(x => x.column === column)?.ascending;
  if (ascending === undefined)
    return [ { column, ascending: true }, ...sortInfo ]

  if (sortInfo[0].column === column)
    ascending = !ascending

  return [ { column, ascending }, ...sortInfo.filter(x => x.column !== column) ]
}

const defaultSortSecuence = [ { column: 0, ascending: true } ]

export {
    stringComparer,
    numberComparer,
    cloneAndSort,
    nextSortSecuence,
    defaultSortSecuence
}