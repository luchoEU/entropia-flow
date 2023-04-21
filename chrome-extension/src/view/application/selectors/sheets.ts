import { OPERATION_TYPE_REFINED_AUCTION_MATERIAL, OPERATION_TYPE_REFINED_BUY_MATERIAL, OPERATION_TYPE_REFINED_SOLD_ACTIVE, SheetsPending } from "../state/sheets"

const sheetPendingMaterial = (state: any, operationType: number, material: string): boolean =>
    state.sheets.pending.find((p: SheetsPending) => p.operationType === operationType && p.material === material) !== undefined

const sheetPendingDate = (state: any, operationType: number, date: number): boolean =>
    state.sheets.pending.find((p: SheetsPending) => p.operationType === operationType && p.date === date) !== undefined

export const sheetPendingRefinedSold = (date: number) => (state: any) => sheetPendingDate(state, OPERATION_TYPE_REFINED_SOLD_ACTIVE, date)
export const sheetPendingRefinedBuy = (material: string) => (state: any) => sheetPendingMaterial(state, OPERATION_TYPE_REFINED_BUY_MATERIAL, material)
export const sheetPendingRefinedAuction = (material: string) => (state: any) => sheetPendingMaterial(state, OPERATION_TYPE_REFINED_AUCTION_MATERIAL, material)
export const getSheets = (state: any) => state.sheets
