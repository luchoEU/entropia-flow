import { OPERATION_TYPE_AUCTION, OPERATION_TYPE_BUY_PER_K, OPERATION_TYPE_BUY_STACKABLE, OPERATION_TYPE_ORDER, OPERATION_TYPE_REFINE, OPERATION_TYPE_SOLD_ACTIVE, OPERATION_TYPE_USE, SheetsPending } from "../state/sheets"

const sheetPendingMaterial = (state: any, operationType: number, material: string): boolean =>
    state.sheets.pending.find((p: SheetsPending) => p.operationType === operationType && p.material === material) !== undefined

const sheetPendingDate = (state: any, operationType: number, date: number): boolean =>
    state.sheets.pending.find((p: SheetsPending) => p.operationType === operationType && p.date === date) !== undefined

export const sheetPendingUse = (material: string) => (state: any) => sheetPendingMaterial(state, OPERATION_TYPE_USE, material)
export const sheetPendingBuyPerK = (material: string) => (state: any) => sheetPendingMaterial(state, OPERATION_TYPE_BUY_PER_K, material)
export const sheetPendingBuyStackable = (material: string) => (state: any) => sheetPendingMaterial(state, OPERATION_TYPE_BUY_STACKABLE, material)
export const sheetPendingRefine = (material: string) => (state: any) => sheetPendingMaterial(state, OPERATION_TYPE_REFINE, material)
export const sheetPendingOrder = (material: string) => (state: any) => sheetPendingMaterial(state, OPERATION_TYPE_ORDER, material)
export const sheetPendingAuction = (material: string) => (state: any) => sheetPendingMaterial(state, OPERATION_TYPE_AUCTION, material)
export const sheetPendingSoldActive = (date: number) => (state: any) => sheetPendingDate(state, OPERATION_TYPE_SOLD_ACTIVE, date)
export const getSheets = (state: any) => state.sheets
