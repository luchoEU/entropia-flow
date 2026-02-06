import { atom } from 'jotai'
import ModeState from '../state/mode'
import {
  initialState,
  reduceSetModeState,
  reduceSetShowSubtitles,
  reduceSetShowVisibleToggle,
  reduceSetMenuPinned,
  reduceSetStreamViewPinned
} from '../helpers/mode'

export const modeAtom = atom<ModeState>(initialState)

export const setModeStateAtom = atom(
  null,
  (get, set, newState: ModeState) => {
    const updated = reduceSetModeState(get(modeAtom), newState)
    set(modeAtom, updated)
  }
)

export const setShowSubtitlesAtom = atom(
  null,
  (get, set, showSubtitles: boolean) => {
    const updated = reduceSetShowSubtitles(get(modeAtom), showSubtitles)
    set(modeAtom, updated)
  }
)

export const setShowVisibleToggleAtom = atom(
  null,
  (get, set, showVisibleToggle: boolean) => {
    const updated = reduceSetShowVisibleToggle(get(modeAtom), showVisibleToggle)
    set(modeAtom, updated)
  }
)

export const pinMenuAtom = atom(
  null,
  (get, set, pinned: boolean) => {
    const updated = reduceSetMenuPinned(get(modeAtom), pinned)
    set(modeAtom, updated)
  }
)

export const pinStreamViewAtom = atom(
  null,
  (get, set, pinned: boolean) => {
    const updated = reduceSetStreamViewPinned(get(modeAtom), pinned)
    set(modeAtom, updated)
  }
)
