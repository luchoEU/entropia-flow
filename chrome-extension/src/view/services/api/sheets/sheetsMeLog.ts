import { SetStage } from "../../../application/state/actives"
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

const ME_LOG_SHEET_NAME = 'ME Log'

class MELogSheet {
    private setStage: SetStage
    private sheet: any
    private row: number
    private daysSinceLastEntry: number

    constructor(setStage: SetStage) {
        this.setStage = setStage
    }
    
    public async load(doc: any) {
        this.sheet = await getSheet(doc, ME_LOG_SHEET_NAME, this.setStage)
        this.row = getLastRow(this.sheet) + 1
        this.daysSinceLastEntry = this._getDaysSinceLastEntry()
    }

    public async save(): Promise<void> {
        await saveUpdatedCells(this.sheet, this.setStage)
    }

    private _getDaysSinceLastEntry(): number {
        let n = 0
        const d = new Date()
        const p = this.sheet.getCell(this.row - 1, DATE_COLUMN).formattedValue
        while (n < 1000) {
            const s = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear() % 100}`
            if (p === s)
                break
            n = n + 1
            d.setDate(d.getDate() - 1)
        }
        return n
    }

    private _fillRow(type: string, pedFormula: string): number {
        const row1 = this.row + 1
        this.sheet.getCell(this.row, DATE_COLUMN).formula = `=A${this.row}+${this.daysSinceLastEntry}`
        this.sheet.getCell(this.row, TYPE_COLUMN).value = type
        this.sheet.getCell(this.row, PED_COLUMN).formula = pedFormula
        this.sheet.getCell(this.row, A_ME_COLUMN).formula = `=J${this.row}+C${row1}`
        this.sheet.getCell(this.row, A_LME_COLUMN).formula = `=K${this.row}+D${row1}`
        this.sheet.getCell(this.row, A_FN_COLUMN).formula = `=L${this.row}+E${row1}`
        this.sheet.getCell(this.row, A_SW_COLUMN).formula = `=M${this.row}+F${row1}`
        this.sheet.getCell(this.row, A_DW_COLUMN).formula = `=N${this.row}+G${row1}`
        this.sheet.getCell(this.row, A_VSC_COLUMN).formula = `=O${this.row}+H${row1}`
        this.sheet.getCell(this.row, A_PED_COLUMN).formula = `=P${this.row}+I${row1}`
        this.sheet.getCell(this.row, PROFIT_COLUMN).formula = `=J${row1}/10000*$U$1+L${row1}/100*$U$2+M${row1}/1000*$U$3+K${row1}/10000*$Y$1+N${row1}/100*$Y$2+O${row1}/1000*$Y$3+P${row1}`
        this.sheet.getCell(this.row, EXTRA_COLUMN).formula = `=J${row1}*($U$1-1)/10000+L${row1}*($U$2-1)/100+(M${row1}+O${row1})*$U$3/1000+K${row1}/10000*($Y$1-1)+N${row1}/100*($Y$2-1)`
        this.sheet.getCell(this.row - 1, EXTRA_COLUMN).formula = `=J${row1}/10000*$U$1+L${row1}/100*$U$2+M${row1}/1000*$U$3+K${row1}/10000*$Y$1+N${row1}/100*$Y$2+O${row1}/1000*$Y$3`
        this.sheet.getCell(this.row - 2, EXTRA_COLUMN).value = null
        
        const row = this.row
        this.row = row1
        this.daysSinceLastEntry = 0
        return row
    }

    private _sell(column: number, amount: string, fee: string, value: string, type: string): number {
        const feeS = fee.replace('.', ',')
        this.sheet.getCell(this.row, column).formula = `=-${amount}*0`
        return this._fillRow(type, `=-${feeS}+${value}*0`)
    }

    public sellME(amount: string, fee: string, value: string): number {
        return this._sell(ME_COLUMN, amount, fee, value, 'Auction')
    }
    
    public sellLME(amount: string, fee: string, value: string): number {
        return this._sell(LME_COLUMN, amount, fee, value, 'AuctionL')
    }
    
    private _sold(row: number, column: number, amount: string, fee: string, value: string): number {
        this.sheet.getCell(row, column).value = -Number(amount)
        const feeS = fee.replace('.', ',')
        this.sheet.getCell(row, PED_COLUMN).formula = `=-${feeS}+${value}`
        return row
    }
    
    public meSold(row: number, amount: string, fee: string, value: string): number {
        return this._sold(row, ME_COLUMN, amount, fee, value)
    }
    
    public lmeSold(row: number, amount: string, fee: string, value: string): number {
        return this._sold(row, LME_COLUMN, amount, fee, value)
    }
    
    public orderNexus(markup: string, value: string): number {
        return this._fillRow('Order FN', `=-${value}*${markup}%*0-1`)
    }
    
    public buySweat(price: string, amount: string): number {
        const row1 = this.row + 1
        const priceS = price.replace('.', ',')
        this.sheet.getCell(this.row, SW_COLUMN).value = Number(amount)
        return this._fillRow('Buy SW', `=-F${row1}/1000*${priceS}`)
    }

    private _stackable(ttValue: string, markup: string, title: string, column: number, letter: string, multi: number): number {
        const row1 = this.row + 1
        const markupS = markup.replace('.', ',')
        this.sheet.getCell(this.row, column).value = Number(ttValue) * multi
        return this._fillRow(title, `=-${letter}${row1}/${multi}*${markupS}%`)
    }
    
    public buyNexus(ttValue: string, markup: string): number {
        return this._stackable(ttValue, markup, 'Buy ME', ME_COLUMN, 'C', 10000)
    }
    
    public buyME(ttValue: string, markup: string): number {
        return this._stackable(ttValue, markup, 'Buy LME', LME_COLUMN, 'D', 10000)
    }
    
    public buyLME(ttValue: string, markup: string): number {
        return this._stackable(ttValue, markup, 'Buy FN', FN_COLUMN, 'E', 100)
    }
    
    public buyDiluted(ttValue: string, markup: string): number {
        return this._stackable(ttValue, markup, 'Buy DW', DW_COLUMN, 'G', 100)
    }
    
    private _refine(amount: string, title: string, meColumn: number, swColumn, letter: string, multi: number): number {
        const row1 = this.row + 1
        this.sheet.getCell(this.row, meColumn).value = `=-${letter}${row1}*${multi.toLocaleString('es-UY')}`
        this.sheet.getCell(this.row, FN_COLUMN).value = `=${letter}${row1}`
        this.sheet.getCell(this.row, swColumn).value = -Number(amount)
        return this._fillRow(title, `=${letter}${row1}/1000*0,15`)
    }
    
    public refineME(amount: string): number {
        return this._refine(amount, 'Refine', ME_COLUMN, SW_COLUMN, 'F', 100.1)
    }
    
    public refineLME(amount: string): number {
        return this._refine(amount, 'RefineL', LME_COLUMN, DW_COLUMN, 'G', 200)
    }
}

export {
    MELogSheet
}
