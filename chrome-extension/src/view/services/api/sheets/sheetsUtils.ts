import { GoogleSpreadsheet } from 'google-spreadsheet'
import { SheetAccessInfo } from '../../../application/state/settings';
import { SetStage, STAGE_LOADING_INVENTORY_SHEET, STAGE_LOADING_ME_LOG_SHEET, STAGE_LOADING_SPREADSHEET, STAGE_SAVING, STAGE_BUDGET_HAS_SHEET, STATE_LOADING_BUDGET_SHEET, STAGE_CREATING_BUDGET_SHEET } from './sheetsStages';

const ME_LOG_SHEET_NAME = 'ME Log'
const INVENTORY_SHEET_NAME = 'Inventory'
const DATE_FORMAT = { type: 'DATE', pattern: 'd/m/yy' }

async function getSpreadsheet(accessInfo: SheetAccessInfo, setStage: SetStage) {
    setStage(STAGE_LOADING_SPREADSHEET)
    const doc = new GoogleSpreadsheet(accessInfo.documentId)

    await doc.useServiceAccountAuth({
        client_email: accessInfo.googleServiceAccountEmail,
        private_key: accessInfo.googlePrivateKey,
    })

    await doc.loadInfo()
    return doc
}

async function getSheet(doc: any, title: string, setStage: SetStage, stage: number): Promise<any> {
    setStage(stage)
    const sheet = doc.sheetsByTitle[title]
    if (sheet !== undefined)
        await sheet.loadCells()
    return sheet
}

async function getMeLogSheet(doc: any, setStage: SetStage): Promise<any> {
    return await getSheet(doc, ME_LOG_SHEET_NAME, setStage, STAGE_LOADING_ME_LOG_SHEET)
}

async function getInventorySheet(doc: any, setStage: SetStage): Promise<any> {
    return await getSheet(doc, INVENTORY_SHEET_NAME, setStage, STAGE_LOADING_INVENTORY_SHEET)
}

const budgetTitle = (itemName: string): string => itemName + " - Entropia Flow"

async function hasBudgetSheet(doc: any, setStage: SetStage, itemName: string): Promise<any> {
    setStage(STAGE_BUDGET_HAS_SHEET)
    return doc.sheetsByTitle[budgetTitle(itemName)] !== undefined
}

async function getBudgetSheet(doc: any, setStage: SetStage, itemName: string): Promise<any> {
    return await getSheet(doc, budgetTitle(itemName), setStage, STATE_LOADING_BUDGET_SHEET)
}

async function createBudgetSheet(doc: any, setStage: SetStage, itemName: string, columnCount: number): Promise<any> {
    setStage(STAGE_CREATING_BUDGET_SHEET)
    const sheet = await doc.addSheet()
    await sheet.updateProperties({
        title: budgetTitle(itemName),
        gridProperties: {
            rowCount: 1000,
            columnCount,
            frozenRowCount: 5
        }
    })
    await sheet.loadCells()
    return sheet
}

async function saveUpdatedCells(sheet: any, setStage: SetStage): Promise<void> {
    setStage(STAGE_SAVING)
    await sheet.saveUpdatedCells()
}

function getLastRow(sheet: any, column: number): number {
    // last non empty cell of the first column
    let row = sheet.rowCount - 1
    while (row > 0 && sheet.getCell(row, column).value === null)
        row--
    return row
}

function getDaysSinceLastEntry(sheet: any, row: number, column: number): number {
    let n = 0
    const d = new Date()
    const p = sheet.getCell(row, column).formattedValue
    while (n < 1000) {
        const s = `${d.getDate()}/${(d.getMonth() + 1)}/${d.getFullYear() % 100}`
        if (p === s)
            break
        n = n + 1
        d.setDate(d.getDate() - 1)
    }
    return n
}

export {
    DATE_FORMAT,
    getSpreadsheet,
    getMeLogSheet,
    getInventorySheet,
    hasBudgetSheet,
    getBudgetSheet,
    createBudgetSheet,
    saveUpdatedCells,
    getLastRow,
    getDaysSinceLastEntry,
}