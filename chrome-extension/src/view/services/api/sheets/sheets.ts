import { SetStage } from '../../../application/state/actives'
import { SheetAccessInfo } from '../../../application/state/settings'
import { newDayInventory } from './sheetsInventory'
import { MELogSheet } from './sheetsMeLog'
import { getSpreadsheet } from './sheetsUtils'

/* region ME Log Sheet */

async function loadMELogSheet(accessInfo: SheetAccessInfo, setStage: SetStage): Promise<MELogSheet> {
    const doc = await getSpreadsheet(accessInfo, setStage)
    const sheet = new MELogSheet(setStage)
    await sheet.load(doc)
    return sheet
}

/* endregion ME Log Sheet */

/* region Inventory Sheet */

async function newDay(accessInfo: SheetAccessInfo, setStage: SetStage) {
    const doc = await getSpreadsheet(accessInfo, setStage)
    newDayInventory(doc, setStage)
}

/* endregion Inventory Sheet */

export default {
    loadMELogSheet,
    newDay,
}