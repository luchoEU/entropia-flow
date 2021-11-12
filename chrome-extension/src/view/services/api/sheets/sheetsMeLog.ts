import { STAGE_SAVING } from "../../../application/state/actives"
import { getLastRow, getSheet, saveUpdatedCells } from "./sheetsUtils"

const DATE_COLUMN = 0
const TYPE_COLUMN = 1
const ME_COLUMN = 2
const LME_COLUMN = 3
const FN_COLUMN = 4
const SW_COLUMN = 5
const DW_COLUMN = 6
const VSC_COLUMN = 7
const PED_COLUMN = 8
const A_ME_COLUMN = 9
const A_LME_COLUMN = 10
const A_FN_COLUMN = 11
const A_SW_COLUMN = 12
const A_DW_COLUMN = 13
const A_VSC_COLUMN = 14
const A_PED_COLUMN = 15
const PROFIT_COLUMN = 16
const EXTRA_COLUMN = 17

const SHEET_NAME = 'ME Log'

function fillRow(sheet: any, row: number, type: string, pedFormula: string) {
    // get days since last entry
    const d = new Date()
    const p = sheet.getCell(row - 1, DATE_COLUMN).formattedValue
    let n = 0
    while (n < 1000) {
        const s = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear() % 100}`
        if (p === s)
            break
        n = n + 1
        d.setDate(d.getDate() - 1)
    }

    const row1 = row + 1
    sheet.getCell(row, DATE_COLUMN).formula = `=A${row}+${n}`
    sheet.getCell(row, TYPE_COLUMN).value = type
    sheet.getCell(row, PED_COLUMN).formula = pedFormula
    sheet.getCell(row, A_ME_COLUMN).formula = `=J${row}+C${row1}`
    sheet.getCell(row, A_LME_COLUMN).formula = `=K${row}+D${row1}`
    sheet.getCell(row, A_FN_COLUMN).formula = `=L${row}+E${row1}`
    sheet.getCell(row, A_SW_COLUMN).formula = `=M${row}+F${row1}`
    sheet.getCell(row, A_DW_COLUMN).formula = `=N${row}+G${row1}`
    sheet.getCell(row, A_VSC_COLUMN).formula = `=O${row}+H${row1}`
    sheet.getCell(row, A_PED_COLUMN).formula = `=P${row}+I${row1}`
    sheet.getCell(row, PROFIT_COLUMN).formula = `=J${row1}/10000*$U$1+L${row1}/100*$U$2+M${row1}/1000*$U$3+K${row1}/10000*$Y$1+N${row1}/100*$Y$2+O${row1}/1000*$Y$3+P${row1}`
    sheet.getCell(row, EXTRA_COLUMN).formula = `=J${row1}*($U$1-1)/10000+L${row1}*($U$2-1)/100+(M${row1}+O${row1})*$U$3/1000+K${row1}/10000*($Y$1-1)+N${row1}/100*($Y$2-1)`
    sheet.getCell(row - 1, EXTRA_COLUMN).formula = `=J${row1}/10000*$U$1+L${row1}/100*$U$2+M${row1}/1000*$U$3+K${row1}/10000*$Y$1+N${row1}/100*$Y$2+O${row1}/1000*$Y$3`
    sheet.getCell(row - 2, EXTRA_COLUMN).value = null
}

async function sell(doc: any, amount: string, fee: string, value: string,
    column: number, type: string, setStage: (stage: number) => void): Promise<number> {
    const sheet = await getSheet(doc, SHEET_NAME, setStage)
    const row = getLastRow(sheet) + 1
    const feeS = fee.replace('.', ',')
    sheet.getCell(row, column).formula = `=-${amount}*0`
    fillRow(sheet, row, type, `=-${feeS}+${value}*0`)
    saveUpdatedCells(sheet, setStage)
    return row
}

async function sold(doc: any, amount: string, fee: string, value: string,
    row: number, column: number, setStage: (stage: number) => void): Promise<number> {
    const sheet = await getSheet(doc, SHEET_NAME, setStage)
    sheet.getCell(row, column).value = -Number(amount)
    const feeS = fee.replace('.', ',')
    sheet.getCell(row, PED_COLUMN).formula = `=-${feeS}+${value}`
    saveUpdatedCells(sheet, setStage)
    return row
}

async function order(doc: any, markup: string, value: string,
    setStage: (stage: number) => void): Promise<number> {
    const sheet = await getSheet(doc, SHEET_NAME, setStage)
    const row = getLastRow(sheet) + 1
    fillRow(sheet, row, 'Order FN', `=-${value}*${markup}%*0-1`)
    saveUpdatedCells(sheet, setStage)
    return row
}

async function sweat(doc: any, price: string, amount: string,
    setStage: (stage: number) => void): Promise<number> {
    const sheet = await getSheet(doc, SHEET_NAME, setStage)
    const row = getLastRow(sheet) + 1
    const row1 = row + 1
    const priceS = price.replace('.', ',')
    sheet.getCell(row, SW_COLUMN).value = Number(amount)
    fillRow(sheet, row, 'Buy SW', `=-F${row1}/1000*${priceS}`)
    saveUpdatedCells(sheet, setStage)
    return row
}

async function stackable(doc: any, ttValue: string, markup: string, title: string, column: number, letter: string, multi: number,
    setStage: (stage: number) => void): Promise<number> {
    const sheet = await getSheet(doc, SHEET_NAME, setStage)
    const row = getLastRow(sheet) + 1
    const row1 = row + 1
    const markupS = markup.replace('.', ',')
    sheet.getCell(row, column).value = Number(ttValue) * multi
    fillRow(sheet, row, title, `=-${letter}${row1}/${multi}*${markupS}%`)
    saveUpdatedCells(sheet, setStage)
    return row
}

async function me(doc: any, ttValue: string, markup: string,
    setStage: (stage: number) => void): Promise<number> {
    return stackable(doc, ttValue, markup, 'Buy ME', ME_COLUMN, 'C', 10000, setStage)
}

async function lme(doc: any, ttValue: string, markup: string,
    setStage: (stage: number) => void): Promise<number> {
    return stackable(doc, ttValue, markup, 'Buy LME', LME_COLUMN, 'D', 10000, setStage)
}

async function nexus(doc: any, ttValue: string, markup: string,
    setStage: (stage: number) => void): Promise<number> {
    return stackable(doc, ttValue, markup, 'Buy FN', FN_COLUMN, 'E', 100, setStage)
}

async function diluted(doc: any, ttValue: string, markup: string,
    setStage: (stage: number) => void): Promise<number> {
    return stackable(doc, ttValue, markup, 'Buy DW', DW_COLUMN, 'G', 100, setStage)
}

async function refine(doc: any, amount: string, title: string, meColumn: number, swColumn, letter: string, multi: number,
    setStage: (stage: number) => void): Promise<number> {
    const sheet = await getSheet(doc, SHEET_NAME, setStage)
    const row = getLastRow(sheet) + 1
    const row1 = row + 1
    sheet.getCell(row, meColumn).value = Number(amount) * multi
    sheet.getCell(row, FN_COLUMN).value = -Number(amount)
    sheet.getCell(row, swColumn).value = -Number(amount)
    fillRow(sheet, row, title, `=${letter}${row1}/1000*0,15`)
    saveUpdatedCells(sheet, setStage)
    return row
}

async function _refineME(doc: any, amount: string,
    setStage: (stage: number) => void): Promise<number> {
    return refine(doc, amount, 'Refine', ME_COLUMN, SW_COLUMN, 'F', 100.1, setStage)
}

async function _refineLME(doc: any, amount: string,
    setStage: (stage: number) => void): Promise<number> {
    return refine(doc, amount, 'RefineL', LME_COLUMN, DW_COLUMN, 'G', 200, setStage)
}

export {
    ME_COLUMN,
    LME_COLUMN,
    sold,
    sell,
    order,
    sweat,
    nexus,
    diluted,
    me,
    lme,
    _refineME,
    _refineLME
}