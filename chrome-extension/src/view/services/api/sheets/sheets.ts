import { SHOW_FEATURES_IN_DEVELOPMENT } from '../../../../config'
import { SheetAccessInfo } from '../../../application/state/settings'
import { BudgetInfoData, BudgetSheet } from './sheetsBudget'
import { newDayInventory } from './sheetsInventory'
import { SetStage } from './sheetsStages'
import { getSpreadsheet, listBudgetSheet } from './sheetsUtils'

let docId = undefined
let doc = undefined

async function loadDoc(accessInfo: SheetAccessInfo, setStage: SetStage): Promise<any> {
    if (docId !== accessInfo.documentId) {
        doc = await getSpreadsheet(accessInfo, setStage)
        docId = accessInfo.documentId
    }
    return doc
}

async function getBudgetSheetList(accessInfo: SheetAccessInfo, setStage: SetStage): Promise<string[]> {
    if (!SHOW_FEATURES_IN_DEVELOPMENT) return []

    const doc = await loadDoc(accessInfo, setStage)
    if (!doc)
        return []

    return listBudgetSheet(doc)
}

async function loadBudgetSheet(accessInfo: SheetAccessInfo, setStage: SetStage, data: BudgetInfoData, create: boolean): Promise<BudgetSheet> {
    if (!SHOW_FEATURES_IN_DEVELOPMENT) return undefined

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

async function newDay(accessInfo: SheetAccessInfo, setStage: SetStage) {
    if (!SHOW_FEATURES_IN_DEVELOPMENT) return

    const doc = await loadDoc(accessInfo, setStage)
    if (!doc) return

    newDayInventory(doc, setStage)
}

export default {
    getBudgetSheetList,
    loadBudgetSheet,
    newDay,
}