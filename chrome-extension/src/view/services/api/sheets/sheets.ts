import { Feature, isFeatureEnabled, SettingsState, SheetAccessInfo } from '../../../application/state/settings'
import { BudgetInfoData, BudgetSheet } from './sheetsBudget'
import { SetStage } from './sheetsStages'
import { TTServiceInventorySheet } from './sheetsTTServiceInventory'
import { getSpreadsheet, listBudgetSheet } from './sheetsUtils'
import { GoogleSpreadsheet } from 'google-spreadsheet'

class DocumentCache {
    private _docId: string
    private _doc: GoogleSpreadsheet
    private _docIdSelector: (accessInfo: SheetAccessInfo) => string

    constructor(docIdSelector: (accessInfo: SheetAccessInfo) => string) {
        this._docId = undefined
        this._doc = undefined
        this._docIdSelector = docIdSelector
    }

    async load(accessInfo: SheetAccessInfo, setStage: SetStage): Promise<GoogleSpreadsheet> {
        const requestedDocId = this._docIdSelector(accessInfo)
        if (this._docId !== requestedDocId) {
            this._doc = await getSpreadsheet(requestedDocId, accessInfo, setStage)
            this._docId = requestedDocId
        }
        return this._doc
    }
}
const budgetDoc = new DocumentCache(s => s.budgetDocumentId)
const ttDoc = new DocumentCache(s => s.ttServiceDocumentId)

async function getBudgetSheetList(settings: SettingsState, setStage: SetStage): Promise<string[]> {
    if (!isFeatureEnabled(settings, Feature.budget)) return undefined

    const doc = await budgetDoc.load(settings.sheet, setStage)
    if (!doc)
        return []

    return listBudgetSheet(doc)
}

async function loadBudgetSheet(settings: SettingsState, setStage: SetStage, data: BudgetInfoData, create: boolean): Promise<BudgetSheet> {
    if (!isFeatureEnabled(settings, Feature.budget)) return undefined

    const doc = await budgetDoc.load(settings.sheet, setStage)
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
    const doc = await ttDoc.load(accessInfo, setStage)
    if (!doc)
        return undefined

    const sheet = new TTServiceInventorySheet(setStage)
    if (await sheet.load(doc)) {
        return sheet
    } else {
        return undefined
    }
}

export default {
    getBudgetSheetList,
    loadBudgetSheet,
    loadTTServiceInventorySheet,
}
