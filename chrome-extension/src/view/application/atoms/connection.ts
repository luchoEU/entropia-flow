import { atom } from 'jotai'
import { ConnectionState, initialState } from '../state/connection'
import { atomWithStorage } from 'jotai/utils'
import messages from '../../services/api/messages'

export const connectionAtom = atomWithStorage<ConnectionState>('jotai-v1-connection', initialState)

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
        webSocket,
        status: 'connecting to new URL...'
      }
    })
    // Notify background worker to reconnect with new URL
    messages.setWebSocketUrl(webSocket)
  }
)

// Updates URL from background state restore (no re-send to background)
export const restoreConnectionWebSocketAtom = atom(
  null,
  (get, set, webSocket: string) => {
    const state = get(connectionAtom)
    if (state.client.webSocket !== webSocket) {
      set(connectionAtom, {
        ...state,
        client: { ...state.client, webSocket }
      })
    }
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
