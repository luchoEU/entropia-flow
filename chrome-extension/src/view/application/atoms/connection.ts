import { atom } from 'jotai'
import { ConnectionState } from '../state/connection'
import {
  initialState,
  reduceSetState,
  reduceSetConnectionWebSocket,
  reduceSetConnectionStatus
} from '../helpers/connection'

export const connectionAtom = atom<ConnectionState>(initialState)

export const setConnectionStateAtom = atom(
  null,
  (get, set, newState: ConnectionState) => {
    const updated = reduceSetState(get(connectionAtom), newState)
    set(connectionAtom, updated)
  }
)

export const setConnectionWebSocketAtom = atom(
  null,
  (get, set, webSocket: string) => {
    const updated = reduceSetConnectionWebSocket(get(connectionAtom), webSocket)
    set(connectionAtom, updated)
  }
)

export const setConnectionStatusAtom = atom(
  null,
  (get, set, status: string) => {
    const updated = reduceSetConnectionStatus(get(connectionAtom), status)
    set(connectionAtom, updated)
  }
)
