import { atom } from 'jotai'
import { SheetsState, SheetsPending } from '../state/sheets'
import {
  initialState,
  addPendingChange,
  clearPendingChanges,
  clearPendingChangeAndTimeoutId,
  setTimeoutId
} from '../helpers/sheets'

export const sheetsAtom = atom<SheetsState>(initialState)

export const setSheetsStateAtom = atom(
  null,
  (get, set, newState: SheetsState) => {
    set(sheetsAtom, newState)
  }
)

export const addSheetsPendingChangeAtom = atom(
  null,
  (get, set, operationType: number, date: number, material: string, parameters: any[], doneParameters?: any) => {
    const updated = addPendingChange(
      get(sheetsAtom),
      operationType,
      date,
      material,
      parameters,
      doneParameters
    )
    set(sheetsAtom, updated)
  }
)

export const clearSheetsPendingChangesAtom = atom(
  null,
  (get, set) => {
    const updated = clearPendingChanges(get(sheetsAtom))
    set(sheetsAtom, updated)
  }
)

export const setSheetsPendingChangesTimeoutAtom = atom(
  null,
  (get, set, timeoutId: NodeJS.Timeout) => {
    const updated = setTimeoutId(get(sheetsAtom), timeoutId)
    set(sheetsAtom, updated)
  }
)

export const clearSheetsPendingChangeAndTimeoutAtom = atom(
  null,
  (get, set) => {
    const updated = clearPendingChangeAndTimeoutId(get(sheetsAtom))
    set(sheetsAtom, updated)
  }
)
