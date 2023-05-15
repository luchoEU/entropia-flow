import { SheetAccessInfo } from '../../../application/state/settings'
import { BudgetInfoData, BudgetSheet } from './sheetsBudget'
import { newDayInventory } from './sheetsInventory'
import { SetStage } from './sheetsStages'
import { TITLE_SUFFIX, getSpreadsheet } from './sheetsUtils'

let docId = undefined
let doc = undefined

async function loadDoc(accessInfo: SheetAccessInfo, setStage: SetStage) {
    if (docId !== accessInfo.documentId) {
        doc = await getSpreadsheet(accessInfo, setStage)
        docId = accessInfo.documentId
    }
}

async function getBudgetSheetList(accessInfo: SheetAccessInfo, setStage: SetStage): Promise<string[]> {
    await loadDoc(accessInfo, setStage)
    const list = doc.sheetsByIndex.filter(s => s.title.endsWith(TITLE_SUFFIX)).map(s => s.title.substring(0, s.title.indexOf(TITLE_SUFFIX)))
    return list
}

async function loadBudgetSheet(accessInfo: SheetAccessInfo, setStage: SetStage, data: BudgetInfoData, create: boolean): Promise<BudgetSheet> {
    await loadDoc(accessInfo, setStage)
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
    await loadDoc(accessInfo, setStage)
    newDayInventory(doc, setStage)
}

export default {
    getBudgetSheetList,
    loadBudgetSheet,
    newDay,
}