import { atom } from 'jotai'
import { Status } from '../../../common/state'
import { CLASS_INFO, STRING_CONNECTING } from '../../../common/const'

interface StatusState extends Status {
  showLoading: boolean
}

const initialState: StatusState = {
  class: CLASS_INFO,
  message: STRING_CONNECTING,
  showLoading: true,
  isMonitoring: true
}

export const statusAtom = atom<StatusState>(initialState)

export const setStatusAtom = atom(
  null,
  (get, set, status: Status) => {
    set(statusAtom, {
      ...status,
      showLoading: status.message.includes('...')
    })
  }
)

// Action atoms for timer control (side effects will be handled by middleware/effects)
export const requestTimerOnAtom = atom(
  null,
  (get, set) => {
    // This will be processed by middleware or effects
    // For now, just trigger the action that middleware listens to
  }
)

export const requestTimerOffAtom = atom(
  null,
  (get, set) => {
    // This will be processed by middleware or effects
    // For now, just trigger the action that middleware listens to
  }
)

export const requestRefreshAtom = atom(
  null,
  (get, set) => {
    // This will be processed by middleware or effects
    // For now, just trigger the action that middleware listens to
  }
)
