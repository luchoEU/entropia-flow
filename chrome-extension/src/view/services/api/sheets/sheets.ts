import { SheetAccessInfo } from '../../../application/state/settings'
import { BudgetInfoData, BudgetSheet } from './sheetsBudget'
import { newDayInventory } from './sheetsInventory'
import { MELogSheet } from './sheetsMeLog'
import { SetStage } from './sheetsStages'
import { getSpreadsheet } from './sheetsUtils'

async function loadMELogSheet(accessInfo: SheetAccessInfo, setStage: SetStage): Promise<MELogSheet> {
    const doc = await getSpreadsheet(accessInfo, setStage)
    const sheet = new MELogSheet(setStage)
    await sheet.load(doc)
    return sheet
}

async function loadBudgetSheet(accessInfo: SheetAccessInfo, setStage: SetStage, data: BudgetInfoData, create: boolean): Promise<BudgetSheet> {
    const doc = await getSpreadsheet(accessInfo, setStage)
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
    const doc = await getSpreadsheet(accessInfo, setStage)
    newDayInventory(doc, setStage)
}

export default {
    loadMELogSheet,
    loadBudgetSheet,    
    newDay,
}