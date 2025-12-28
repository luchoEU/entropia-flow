import { GoogleSpreadsheet } from 'google-spreadsheet'
import { SheetAccessInfo } from '../../../application/state/settings';
import { SetStage, STAGE_LOADING_SPREADSHEET, STAGE_SAVING, STAGE_BUDGET_HAS_SHEET, STATE_LOADING_BUDGET_SHEET, STAGE_CREATING_BUDGET_SHEET } from './sheetsStages';

const DATE_FORMAT = { type: 'DATE', pattern: 'd/m/yy' }

const TITLE_SUFFIX = ' - Entropia Flow'
const BudgetSheetName = {
    budget: (itemName: string) => itemName + TITLE_SUFFIX
}
const TTServiceSheetName = {
    inventory: 'Inventory'
}

async function getSpreadsheet(documentId: string, accessInfo: SheetAccessInfo, setStage: SetStage): Promise<GoogleSpreadsheet> {
    setStage(STAGE_LOADING_SPREADSHEET)

    // Can't use the new GoogleSpreadsheet constructor with service account auth in a chrome extension,
    // it needs a Backend to upgrade google-spreadsheet package over 3.3,
    // or do it without the library with OAUTH authentication
    const doc: GoogleSpreadsheet = new GoogleSpreadsheet(documentId)

    await doc.useServiceAccountAuth({
        client_email: accessInfo.googleServiceAccountEmail,
        private_key: accessInfo.googlePrivateKey,
    })

    await doc.loadInfo()
    return doc
}

async function _getSheet(doc: GoogleSpreadsheet, title: string, setStage: SetStage, stage: number): Promise<any> {
    setStage(stage)
    const sheet = doc.sheetsByTitle[title]
    if (sheet !== undefined)
        await sheet.loadCells()
    return sheet
}

async function hasBudgetSheet(doc: GoogleSpreadsheet, setStage: SetStage, itemName: string): Promise<any> {
    setStage(STAGE_BUDGET_HAS_SHEET)
    return doc.sheetsByTitle[BudgetSheetName.budget(itemName)] !== undefined
}

async function getBudgetSheet(doc: GoogleSpreadsheet, setStage: SetStage, itemName: string): Promise<any> {
    return await _getSheet(doc, BudgetSheetName.budget(itemName), setStage, STATE_LOADING_BUDGET_SHEET)
}

async function createBudgetSheet(doc: GoogleSpreadsheet, setStage: SetStage, itemName: string, frozenRowCount: number, columnCount: number): Promise<any> {
    setStage(STAGE_CREATING_BUDGET_SHEET)
    const sheet = await doc.addSheet()
    await sheet.updateProperties({
        title: BudgetSheetName.budget(itemName),
        gridProperties: {
            rowCount: 1000,
            columnCount,
            frozenRowCount
        }
    })
    await sheet.loadCells()
    return sheet
}

async function listBudgetSheet(doc: GoogleSpreadsheet): Promise<string[]> {
    return doc.sheetsByIndex
        .filter(s => s.title.endsWith(TITLE_SUFFIX))
        .map(s => s.title.slice(0, -TITLE_SUFFIX.length));
}

async function getTTServiceInventorySheet(doc: GoogleSpreadsheet, setStage: SetStage): Promise<any> {
    return await _getSheet(doc, TTServiceSheetName.inventory, setStage, STATE_LOADING_BUDGET_SHEET)
}

async function saveUpdatedCells(sheet: any, setStage: SetStage): Promise<void> {
    setStage(STAGE_SAVING)
    await sheet.saveUpdatedCells()
}

function getLastRow(sheet: any, column: number): number {
    // last non empty cell of the column
    let row = sheet.rowCount - 1
    while (row > 0 && sheet.getCell(row, column).value === null)
        row--
    return row
}

const MAX_DAYS = 1000
function getDaysSinceLastEntry(sheet: any, row: number, column: number): number {
    let n = 0
    const d = new Date()
    const p = sheet.getCell(row, column).formattedValue
    while (n < MAX_DAYS) {
        const s = `${d.getDate()}/${(d.getMonth() + 1)}/${d.getFullYear() % 100}`
        if (p === s)
            break
        n = n + 1
        d.setDate(d.getDate() - 1)
    }
    if (n === MAX_DAYS)
        return undefined
    else
        return n
}

function setDayDate(sheet: any, row: number, column: number, letter: string) {
    const daysSinceLastEntry = getDaysSinceLastEntry(sheet, row - 1, column)
    if (daysSinceLastEntry === undefined) {
        const d = new Date()
        sheet.getCell(row, column).formula = `=DATEVALUE("${d.getDate()}/${(d.getMonth() + 1)}/${d.getFullYear()}")`
    } else {
        sheet.getCell(row, column).formula = `=${letter}${row}+${daysSinceLastEntry}`
    }
    sheet.getCell(row, column).numberFormat = DATE_FORMAT
}

const getSheetUrl = (sheet: any) => `https://docs.google.com/spreadsheets/d/${sheet._spreadsheet.spreadsheetId}/edit#gid=${sheet.sheetId}`;

export {
    DATE_FORMAT,
    TITLE_SUFFIX,
    getSpreadsheet,
    hasBudgetSheet,
    getBudgetSheet,
    createBudgetSheet,
    listBudgetSheet,
    getTTServiceInventorySheet,
    saveUpdatedCells,
    getLastRow,
    setDayDate,
    getSheetUrl,
}
