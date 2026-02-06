import { atom } from 'jotai'
import ExpandableState from '../state/expandable'
import {
  initialExpandableState,
  reduceSetExpandableState,
  reduceSetExpanded,
  reduceSetVisible
} from '../helpers/expandable'

export const expandableAtom = atom<ExpandableState>(initialExpandableState)

export const setExpandableStateAtom = atom(
  null,
  (get, set, newState: ExpandableState) => {
    const updated = reduceSetExpandableState(get(expandableAtom), newState)
    set(expandableAtom, updated)
  }
)

export const setExpandedAtom = atom(
  null,
  (get, set, selector: string, expanded: boolean) => {
    const updated = reduceSetExpanded(get(expandableAtom), selector, expanded)
    set(expandableAtom, updated)
  }
)

export const setVisibleAtom = atom(
  null,
  (get, set, selector: string, visible: boolean) => {
    const updated = reduceSetVisible(get(expandableAtom), selector, visible)
    set(expandableAtom, updated)
  }
)
