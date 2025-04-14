import { ENABLE_BUDGET_SHEET_CALLS, ENABLE_INVENTORY_SHEET_CALLS } from '../../../../config'
import { SheetAccessInfo } from '../../../application/state/settings'
import { BudgetInfoData, BudgetSheet } from './sheetsBudget'
import { newDayInventory } from './sheetsInventory'
import { SetStage } from './sheetsStages'
import { TTServiceInventorySheet } from './sheetsTTServiceInventory'
import { getSpreadsheet, listBudgetSheet } from './sheetsUtils'

let docId = undefined
let doc = undefined
let ttDocId = undefined
let ttDoc = undefined

async function loadDoc(accessInfo: SheetAccessInfo, setStage: SetStage): Promise<any> {
    if (docId !== accessInfo.documentId) {
        doc = await getSpreadsheet(accessInfo, setStage)
        docId = accessInfo.documentId
    }
    return doc
}

async function loadTTDoc(accessInfo: SheetAccessInfo, setStage: SetStage): Promise<any> {
    if (ttDocId !== accessInfo.ttServiceDocumentId) {
        ttDoc = await getSpreadsheet(
            { ...accessInfo, documentId: accessInfo.ttServiceDocumentId }, setStage)
        ttDocId = accessInfo.ttServiceDocumentId
    }
    return ttDoc
}

async function getBudgetSheetList(accessInfo: SheetAccessInfo, setStage: SetStage): Promise<string[]> {
    if (!ENABLE_BUDGET_SHEET_CALLS) return []

    const doc = await loadDoc(accessInfo, setStage)
    if (!doc)
        return []

    return listBudgetSheet(doc)
}

async function loadBudgetSheet(accessInfo: SheetAccessInfo, setStage: SetStage, data: BudgetInfoData, create: boolean): Promise<BudgetSheet> {
    if (!ENABLE_BUDGET_SHEET_CALLS) return undefined

    const doc = await loadDoc(accessInfo, setStage)
    if (!doc)
        return undefined

    const sheet = new BudgetSheet(setStage)
    if (await sheet.load(doc, data.itemName)) {
        return sheet
    } else if (create) {
        await sheet.create(doc, data)
        return sheet
    } else {
        return undefined
    }
}

async function loadTTServiceInventorySheet(accessInfo: SheetAccessInfo, setStage: SetStage): Promise<TTServiceInventorySheet> {
    const doc = await loadTTDoc(accessInfo, setStage)
    if (!doc)
        return undefined

    const sheet = new TTServiceInventorySheet(setStage)
    if (await sheet.load(doc)) {
        return sheet
    } else {
        return undefined
    }
}

async function newDay(accessInfo: SheetAccessInfo, setStage: SetStage) {
    if (!ENABLE_INVENTORY_SHEET_CALLS) return

    const doc = await loadDoc(accessInfo, setStage)
    if (!doc) return

    newDayInventory(doc, setStage)
}

export default {
    getBudgetSheetList,
    loadBudgetSheet,
    loadTTServiceInventorySheet,
    newDay,
}