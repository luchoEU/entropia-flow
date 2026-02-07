import { atom } from 'jotai'
import { TradeState, initialState } from '../state/trade'

export const tradeAtom = atom<TradeState>(initialState)

export const setTradeStateAtom = atom(
  null,
  (get, set, newState: TradeState) => {
    set(tradeAtom, newState)
  }
)

export const addTradeMessageNotificationAtom = atom(
  null,
  (get, set, filter: string) => {
    const state = get(tradeAtom)
    set(tradeAtom, {
      ...state,
      notifications: [...state.notifications, { time: new Date().toString(), filter }]
    })
  }
)

export const removeTradeMessageNotificationAtom = atom(
  null,
  (get, set, time: string) => {
    const state = get(tradeAtom)
    set(tradeAtom, {
      ...state,
      notifications: state.notifications.filter(n => n.time !== time)
    })
  }
)

export const setLastTradeMessageCheckSerialAtom = atom(
  null,
  (get, set, serial: number) => {
    const state = get(tradeAtom)
    set(tradeAtom, {
      ...state,
      lastMessageCheckSerial: serial
    })
  }
)
