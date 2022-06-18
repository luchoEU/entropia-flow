import { SetStage } from '../../../application/state/actives'
import { newDayInventory } from './sheetsInventory'
import { MELogSheet } from './sheetsMeLog'
import { getSpreadsheet } from './sheetsUtils'

/* region ME Log Sheet */

async function loadMELogSheet(setStage: SetStage): Promise<MELogSheet> {
    const doc = await getSpreadsheet(setStage)
    const sheet = new MELogSheet(setStage)
    await sheet.load(doc)
    return sheet
}

/* endregion ME Log Sheet */

/* region Inventory Sheet */

async function newDay(setStage: SetStage) {
    const doc = await getSpreadsheet(setStage)
    newDayInventory(doc, setStage)
}

/* endregion Inventory Sheet */

export default {
    loadMELogSheet,
    newDay,
}