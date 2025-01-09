import { SortSecuence } from "../state/sort"

const stringComparer = (a: string, b: string) => a.localeCompare(b)
const numberComparer = (a: number, b: number) => a - b
const byTypeComparer = (a: any, b: any) => 
    (typeof a === 'number' && typeof b === 'number') ? numberComparer(a, b) : stringComparer(a, b)

interface SortColumnDefinition<I, T = any> {
    selector: (item: I) => T,
    comparer: (a: T, b: T) => number,
}

function cloneAndSort<I extends any>(list: Array<I>, sortSecuence: SortSecuence, sortColumnDefinition: Array<SortColumnDefinition<I>>): Array<I> {
    if (!sortSecuence || !sortColumnDefinition) return list

    const newList = [...list]
    newList.sort((a: I, b: I) => {
      for (const s of sortSecuence)
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

function nextSortSecuence(sortSecuence: SortSecuence, column: number): SortSecuence {
  if (!sortSecuence)
    return [ { column, ascending: true } ]

  let ascending = sortSecuence.find(x => x.column === column)?.ascending;
  if (ascending === undefined)
    return [ { column, ascending: true }, ...sortSecuence ]

  if (sortSecuence[0].column === column)
    ascending = !ascending

  return [ { column, ascending }, ...sortSecuence.filter(x => x.column !== column) ]
}

const defaultSortSecuence = [ { column: 0, ascending: true } ]

export {
    SortColumnDefinition,
    stringComparer,
    numberComparer,
    byTypeComparer,
    cloneAndSort,
    nextSortSecuence,
    defaultSortSecuence
}