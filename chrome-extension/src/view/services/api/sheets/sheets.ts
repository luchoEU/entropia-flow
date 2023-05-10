import { SheetAccessInfo } from '../../../application/state/settings'
import { BudgetInfoData, BudgetSheet } from './sheetsBudget'
import { newDayInventory } from './sheetsInventory'
import { SetStage } from './sheetsStages'
import { getSpreadsheet } from './sheetsUtils'

async function getBudgetSheetList(accessInfo: SheetAccessInfo, setStage: SetStage): Promise<string[]> {
    const doc = await getSpreadsheet(accessInfo, setStage)
    return []
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
    loadBudgetSheet,    
    newDay,
}