import { OPERATION_TYPE_USE } from "../state/sheets"

const sheetPending(state: any, operationType: number, material: string) =>
    state.sheets.pending.find(p => p.type === operationType && p.material === material) !== undefined

export const sheetPendingUse = material => state => sheetPending(state, OPERATION_TYPE_USE, material)
export const sheetPendingBuy = material => state => sheetPending(state, OPERATION_TYPE_USE, material)
export const getSheets = state => state.sheets
