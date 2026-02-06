import { atom } from 'jotai'
import { TradeState } from '../state/trade'
import {
  initialState,
  reduceSetTradeState,
  reduceAddTradeMessageNotification,
  reduceRemoveTradeMessageNotification,
  reduceSetLastMessageCheckSerial
} from '../helpers/trade'

export const tradeAtom = atom<TradeState>(initialState)

export const setTradeStateAtom = atom(
  null,
  (get, set, newState: TradeState) => {
    const updated = reduceSetTradeState(get(tradeAtom), newState)
    set(tradeAtom, updated)
  }
)

export const addTradeMessageNotificationAtom = atom(
  null,
  (get, set, filter: string) => {
    const updated = reduceAddTradeMessageNotification(get(tradeAtom), filter)
    set(tradeAtom, updated)
  }
)

export const removeTradeMessageNotificationAtom = atom(
  null,
  (get, set, time: string) => {
    const updated = reduceRemoveTradeMessageNotification(get(tradeAtom), time)
    set(tradeAtom, updated)
  }
)

export const setLastTradeMessageCheckSerialAtom = atom(
  null,
  (get, set, serial: number) => {
    const updated = reduceSetLastMessageCheckSerial(get(tradeAtom), serial)
    set(tradeAtom, updated)
  }
)
