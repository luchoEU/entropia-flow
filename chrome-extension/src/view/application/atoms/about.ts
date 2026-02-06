import { atom } from 'jotai'
import { AboutState } from '../state/about'
import {
  initialState,
  setState,
  setExpanded
} from '../helpers/about'

export const aboutAtom = atom<AboutState>(initialState)

export const setAboutStateAtom = atom(
  null,
  (get, set, newState: AboutState) => {
    const updated = setState(get(aboutAtom), newState)
    set(aboutAtom, updated)
  }
)

export const setAboutExpandedAtom = atom(
  null,
  (get, set, part: string, expanded: boolean) => {
    const updated = setExpanded(get(aboutAtom), part, expanded)
    set(aboutAtom, updated)
  }
)
