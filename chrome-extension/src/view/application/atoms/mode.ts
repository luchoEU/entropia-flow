import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import ModeState, { initialState } from '../state/mode'

export const modeAtom = atomWithStorage<ModeState>('jotai-v1-mode', initialState)

export const setModeStateAtom = atom(
  null,
  (get, set, newState: ModeState) => {
    set(modeAtom, newState)
  }
)

export const setShowSubtitlesAtom = atom(
  null,
  (get, set, showSubtitles: boolean) => {
    const state = get(modeAtom)
    set(modeAtom, { ...state, showSubtitles })
  }
)

export const setShowVisibleToggleAtom = atom(
  null,
  (get, set, showVisibleToggle: boolean) => {
    const state = get(modeAtom)
    set(modeAtom, { ...state, showVisibleToggle })
  }
)

export const pinMenuAtom = atom(
  null,
  (get, set, pinned: boolean) => {
    const state = get(modeAtom)
    set(modeAtom, { ...state, menuPinned: pinned })
  }
)

export const pinStreamViewAtom = atom(
  null,
  (get, set, pinned: boolean) => {
    const state = get(modeAtom)
    set(modeAtom, { ...state, streamViewPinned: pinned })
  }
)
