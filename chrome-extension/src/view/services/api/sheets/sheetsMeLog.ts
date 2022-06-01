import { getLastRow } from "./sheetsUtils"

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

const ME_LOG_SHEET_NAME = 'ME Log'

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

async function sell(sheet: any, amount: string, fee: string, value: string,
    column: number, type: string): Promise<number> {
    const row = getLastRow(sheet) + 1
    const feeS = fee.replace('.', ',')
    sheet.getCell(row, column).formula = `=-${amount}*0`
    fillRow(sheet, row, type, `=-${feeS}+${value}*0`)
    return row
}

async function sold(sheet: any, amount: string, fee: string, value: string,
    row: number, column: number): Promise<number> {
    sheet.getCell(row, column).value = -Number(amount)
    const feeS = fee.replace('.', ',')
    sheet.getCell(row, PED_COLUMN).formula = `=-${feeS}+${value}`
    return row
}

async function order(sheet: any, markup: string, value: string): Promise<number> {
    const row = getLastRow(sheet) + 1
    fillRow(sheet, row, 'Order FN', `=-${value}*${markup}%*0-1`)
    return row
}

async function sweat(sheet: any, price: string, amount: string): Promise<number> {
    const row = getLastRow(sheet) + 1
    const row1 = row + 1
    const priceS = price.replace('.', ',')
    sheet.getCell(row, SW_COLUMN).value = Number(amount)
    fillRow(sheet, row, 'Buy SW', `=-F${row1}/1000*${priceS}`)
    return row
}

async function stackable(sheet: any, ttValue: string, markup: string, title: string, column: number, letter: string, multi: number): Promise<number> {
    const row = getLastRow(sheet) + 1
    const row1 = row + 1
    const markupS = markup.replace('.', ',')
    sheet.getCell(row, column).value = Number(ttValue) * multi
    fillRow(sheet, row, title, `=-${letter}${row1}/${multi}*${markupS}%`)
    return row
}

async function me(sheet: any, ttValue: string, markup: string): Promise<number> {
    return stackable(sheet, ttValue, markup, 'Buy ME', ME_COLUMN, 'C', 10000)
}

async function lme(sheet: any, ttValue: string, markup: string): Promise<number> {
    return stackable(sheet, ttValue, markup, 'Buy LME', LME_COLUMN, 'D', 10000)
}

async function nexus(sheet: any, ttValue: string, markup: string): Promise<number> {
    return stackable(sheet, ttValue, markup, 'Buy FN', FN_COLUMN, 'E', 100)
}

async function diluted(doc: any, ttValue: string, markup: string): Promise<number> {
    return stackable(doc, ttValue, markup, 'Buy DW', DW_COLUMN, 'G', 100)
}

async function refine(sheet: any, amount: string, title: string, meColumn: number, swColumn, letter: string, multi: number): Promise<number> {
    const row = getLastRow(sheet) + 1
    const row1 = row + 1
    sheet.getCell(row, meColumn).value = `=-${letter}${row1}*${multi.toLocaleString('es-UY')}`
    sheet.getCell(row, FN_COLUMN).value = `=${letter}${row1}`
    sheet.getCell(row, swColumn).value = -Number(amount)
    fillRow(sheet, row, title, `=${letter}${row1}/1000*0,15`)
    return row
}

async function _refineME(sheet: any, amount: string): Promise<number> {
    return refine(sheet, amount, 'Refine', ME_COLUMN, SW_COLUMN, 'F', 100.1)
}

async function _refineLME(sheet: any, amount: string): Promise<number> {
    return refine(sheet, amount, 'RefineL', LME_COLUMN, DW_COLUMN, 'G', 200)
}

export {
    ME_COLUMN,
    LME_COLUMN,
    ME_LOG_SHEET_NAME,
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