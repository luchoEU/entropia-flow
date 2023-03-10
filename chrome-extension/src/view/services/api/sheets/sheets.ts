import { BlueprintData } from '../../../application/state/craft'
import { SheetAccessInfo } from '../../../application/state/settings'
import { BudgetSheet } from './sheetsBudget'
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

async function loadBudgetSheet(accessInfo: SheetAccessInfo, data: BlueprintData, setStage: SetStage): Promise<BudgetSheet> {
    const doc = await getSpreadsheet(accessInfo, setStage)
    const sheet = new BudgetSheet(data, setStage)
    if (!await sheet.load(doc))
        await sheet.create(doc)
    return sheet
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