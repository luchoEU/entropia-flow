import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import ExpandableState from '../state/expandable'
import { initialExpandableState } from '../helpers/expandable'

export const expandableAtom = atomWithStorage<ExpandableState>('jotai-v1-expandable', initialExpandableState)

export const setExpandableStateAtom = atom(
  null,
  (get, set, newState: ExpandableState) => {
    set(expandableAtom, newState)
  }
)

export const setExpandedAtom = atom(
  null,
  (get, set, selector: string, expanded: boolean) => {
    const state = get(expandableAtom)
    set(expandableAtom, {
      ...state,
      collapsed: expanded ? state.collapsed.filter(x => x !== selector) : [...state.collapsed, selector]
    })
  }
)

export const setVisibleAtom = atom(
  null,
  (get, set, selector: string, visible: boolean) => {
    const state = get(expandableAtom)
    set(expandableAtom, {
      ...state,
      hidden: visible ? state.hidden.filter(x => x !== selector) : [...state.hidden, selector]
    })
  }
)
