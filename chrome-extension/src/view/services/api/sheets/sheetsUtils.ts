import { GoogleSpreadsheet } from 'google-spreadsheet'
import { SetStage, STAGE_LOADING_ME_LOG_SHEET, STAGE_LOADING_SPREADSHEET, STAGE_SAVING } from '../../../application/state/actives'
import { DOC_ID, GOOGLE_PRIVATE_KEY, GOOGLE_SERVICE_ACCOUNT_EMAIL } from './sheetsConst'

async function getSpreadsheet(setStage: SetStage) {
    setStage(STAGE_LOADING_SPREADSHEET)
    const doc = new GoogleSpreadsheet(DOC_ID)

    await doc.useServiceAccountAuth({
        client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: GOOGLE_PRIVATE_KEY,
    })

    await doc.loadInfo()
    return doc
}

async function getSheet(doc: any, title: string, setStage: SetStage) {
    setStage(STAGE_LOADING_ME_LOG_SHEET)
    let sheet = doc.sheetsByTitle[title]
    await sheet.loadCells()
    return sheet
}

async function saveUpdatedCells(sheet: any, setStage: SetStage) {
    setStage(STAGE_SAVING)
    await sheet.saveUpdatedCells()
}

function getLastRow(sheet: any): number {
    // last non empty cell of the first column
    let row = sheet.rowCount - 1
    while (row > 0 && sheet.getCell(row, 0).value === null)
        row--
    return row
}

export {
    getSpreadsheet,
    getSheet,
    saveUpdatedCells,
    getLastRow,
}