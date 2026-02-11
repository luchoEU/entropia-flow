import { atom } from 'jotai'
import { Status } from '../../../common/state'
import { CLASS_INFO, STRING_CONNECTING } from '../../../common/const'
import messagesAPI from '../../services/api/messages'

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
  (_, set, status: Status) => {
    set(statusAtom, {
      ...status,
      showLoading: status.message.includes('...')
    })
  }
)

// Action atoms for timer control
export const requestTimerOnAtom = atom(
  null,
  () => {
    messagesAPI.requestTimerOn()
  }
)

export const requestTimerOffAtom = atom(
  null,
  () => {
    messagesAPI.requestTimerOff()
  }
)

export const requestRefreshAtom = atom(
  null,
  () => {
    messagesAPI.requestRefresh(false)
  }
)
