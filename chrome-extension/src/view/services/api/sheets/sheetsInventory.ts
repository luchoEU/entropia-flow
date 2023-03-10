import { SetStage } from "./sheetsStages";
import { getInventorySheet, getLastRow, saveUpdatedCells } from "./sheetsUtils";

const DATE_COLUMN = 0
const PEDS_COLUMN = 1
const PROFIT_DAY_COLUMN = 2
const PROFIT_MONTH_COLUMN = 3

async function newDayInventory(doc: any, setStage: SetStage) {
    const sheet = await getInventorySheet(doc, setStage)
    const row = getLastRow(sheet) + 1
    const row1 = row + 1

    // add row in the left table
    sheet.getCell(row, DATE_COLUMN).formula = `=A${row}+1`
    sheet.getCell(row, PEDS_COLUMN).formula = sheet.getCell(row - 1, PEDS_COLUMN).formula
    sheet.getCell(row, PROFIT_DAY_COLUMN).formula = `=B${row1}-B${row}`
    sheet.getCell(row, PROFIT_MONTH_COLUMN).formula = sheet.getCell(row - 1, PROFIT_MONTH_COLUMN).formula.replace(row.toString(), row1.toString())

    // move right table footer
    for (let n = 3; n >= 1; n--) {
        const rowN = row + n
        const rowN1 = row + n + 1
        for (let column = 16; column <= 34; column++) {
            sheet.getCell(rowN1, column).formula = sheet.getCell(rowN, column).formula
        }
    }
    for (let column = 16; column <= 36; column++) {
        sheet.getCell(row1, column).value = sheet.getCell(row, column).value
        sheet.getCell(row, column).value = null
    }

    // save
    await saveUpdatedCells(sheet, setStage)
}

export {
    newDayInventory,
}