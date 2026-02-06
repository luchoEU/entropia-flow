import { atom } from 'jotai'
import { TabularState, TabularRawData } from '../state/tabular'
import {
  initialState,
  reduceSetTabularState,
  reduceSetTabularFilter,
  reduceSetTabularData,
  reduceSortTabularBy
} from '../helpers/tabular'

export const tabularAtom = atom<TabularState>(initialState)

export const setTabularStateAtom = atom(
  null,
  (get, set, newState: TabularState) => {
    const updated = reduceSetTabularState(get(tabularAtom), newState)
    set(tabularAtom, updated)
  }
)

export const setTabularFilterAtom = atom(
  null,
  (get, set, selector: string, filter: string) => {
    const updated = reduceSetTabularFilter(get(tabularAtom), selector, filter)
    set(tabularAtom, updated)
  }
)

export const setTabularDataAtom = atom(
  null,
  (get, set, data: TabularRawData) => {
    const updated = reduceSetTabularData(get(tabularAtom), data)
    set(tabularAtom, updated)
  }
)

export const sortTabularByAtom = atom(
  null,
  (get, set, selector: string, column: number) => {
    const updated = reduceSortTabularBy(get(tabularAtom), selector, column)
    set(tabularAtom, updated)
  }
)
