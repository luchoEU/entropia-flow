import { GoogleSpreadsheet } from 'google-spreadsheet'
import { SetStage, STAGE_LOADING_ME_LOG_SHEET, STAGE_LOADING_SPREADSHEET, STAGE_SAVING } from '../../../application/state/actives'
import { SheetAccessInfo } from '../../../application/state/settings';

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

async function getSheet(doc: any, title: string, setStage: SetStage): Promise<any> {
    setStage(STAGE_LOADING_ME_LOG_SHEET)
    let sheet = doc.sheetsByTitle[title]
    await sheet.loadCells()
    return sheet
}

async function saveUpdatedCells(sheet: any, setStage: SetStage): Promise<void> {
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