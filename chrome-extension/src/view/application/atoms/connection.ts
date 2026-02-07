import { atom } from 'jotai'
import { ConnectionState, initialState } from '../state/connection'

export const connectionAtom = atom<ConnectionState>(initialState)

export const setConnectionStateAtom = atom(
  null,
  (get, set, newState: ConnectionState) => {
    set(connectionAtom, newState)
  }
)

export const setConnectionWebSocketAtom = atom(
  null,
  (get, set, webSocket: string) => {
    const state = get(connectionAtom)
    set(connectionAtom, {
      ...state,
      client: {
        ...state.client,
        webSocket
      }
    })
  }
)

export const setConnectionStatusAtom = atom(
  null,
  (get, set, status: string) => {
    const state = get(connectionAtom)
    set(connectionAtom, {
      ...state,
      client: {
        ...state.client,
        status
      }
    })
  }
)
