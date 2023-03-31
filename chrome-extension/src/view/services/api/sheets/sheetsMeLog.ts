import { SetStage } from "./sheetsStages"
import { getLastRow, getMeLogSheet, saveUpdatedCells, setDayDate } from "./sheetsUtils"

const DATE_COLUMN = 0
const TYPE_COLUMN = 1
const ME_COLUMN = 2
const LME_COLUMN = 3
const NB_COLUMN = 4
const FN_COLUMN = 5
const SS_COLUMN = 6
const FT_COLUMN = 7
const SW_COLUMN = 8
const DW_COLUMN = 9
const VSC_COLUMN = 10
const PED_COLUMN = 11
const A_ME_COLUMN = 12
const A_LME_COLUMN = 13
const A_NB_COLUMN = 14
const A_FN_COLUMN = 15
const A_SS_COLUMN = 16
const A_FT_COLUMN = 17
const A_SW_COLUMN = 18
const A_DW_COLUMN = 19
const A_VSC_COLUMN = 20
const A_PED_COLUMN = 21
const PROFIT_COLUMN = 22
const EXTRA_COLUMN = 23

class MELogSheet {
    private setStage: SetStage
    private sheet: any
    private row: number

    constructor(setStage: SetStage) {
        this.setStage = setStage
    }
    
    public async load(doc: any) {
        this.sheet = await getMeLogSheet(doc, this.setStage)
        this.row = getLastRow(this.sheet, DATE_COLUMN) + 1
    }

    public async save(): Promise<void> {
        await saveUpdatedCells(this.sheet, this.setStage)
    }

    private _fillRow(type: string, pedFormula: string): number {
        const row1 = this.row + 1
        setDayDate(this.sheet, this.row, DATE_COLUMN, 'A')
        this.sheet.getCell(this.row, TYPE_COLUMN).value = type
        this.sheet.getCell(this.row, PED_COLUMN).formula = pedFormula
        this.sheet.getCell(this.row, A_ME_COLUMN).formula = `=M${this.row}+C${row1}`
        this.sheet.getCell(this.row, A_LME_COLUMN).formula = `=N${this.row}+D${row1}`
        this.sheet.getCell(this.row, A_NB_COLUMN).formula = `=O${this.row}+E${row1}`
        this.sheet.getCell(this.row, A_FN_COLUMN).formula = `=P${this.row}+F${row1}`
        this.sheet.getCell(this.row, A_SS_COLUMN).formula = `=Q${this.row}+G${row1}`
        this.sheet.getCell(this.row, A_FT_COLUMN).formula = `=R${this.row}+H${row1}`
        this.sheet.getCell(this.row, A_SW_COLUMN).formula = `=S${this.row}+I${row1}`
        this.sheet.getCell(this.row, A_DW_COLUMN).formula = `=T${this.row}+J${row1}`
        this.sheet.getCell(this.row, A_VSC_COLUMN).formula = `=U${this.row}+K${row1}`
        this.sheet.getCell(this.row, A_PED_COLUMN).formula = `=V${this.row}+L${row1}`
        this.sheet.getCell(this.row, PROFIT_COLUMN).formula = `=M${row1}/10000*$AA$1+N${row1}/10000*$AE$1+O${row1}/100*$AH$3+P${row1}/100*$AA$2+Q${row1}/100*$AH$1+R${row1}/1000*$AH$2+S${row1}/1000*$AA$3+T${row1}/100*$AE$2+U${row1}/1000*$AE$3+V${row1}`
        this.sheet.getCell(this.row, EXTRA_COLUMN).formula = `=X${this.row}-(M${row1}/10000+N${row1}/10000+O${row1}/100+P${row1}/100+Q${row1}/100+R${row1}/100000+S${row1}/100000+T${row1}/100+U${row1}/1000)`
        this.sheet.getCell(this.row - 1, EXTRA_COLUMN).formula = `=-V${row1}+W${row1}`
        this.sheet.getCell(this.row - 2, EXTRA_COLUMN).value = null
        
        const row = this.row
        this.row = row1
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
    
    public sellNB(amount: string, fee: string, value: string): number {
        return this._sell(NB_COLUMN, amount, fee, value, 'AuctionN')
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
    
    public nbSold(row: number, amount: string, fee: string, value: string): number {
        return this._sold(row, NB_COLUMN, amount, fee, value)
    }

    public orderNexus(markup: string, value: string): number {
        return this._fillRow('Order FN', `=-${value}*${markup}%*0-1`)
    }
    
    public _stackableK(price: string, amount: string, title: string, column: number, letter: string): number {
        const row1 = this.row + 1
        const priceS = price.replace('.', ',')
        this.sheet.getCell(this.row, column).value = Number(amount)
        return this._fillRow(title, `=-${letter}${row1}/1000*${priceS}`)
    }

    private _stackableMU(ttValue: string, markup: string, title: string, column: number, letter: string, multi: number): number {
        const row1 = this.row + 1
        const markupS = markup.replace('.', ',')
        this.sheet.getCell(this.row, column).value = Number(ttValue) * multi
        return this._fillRow(title, `=-${letter}${row1}/${multi}*${markupS}%`)
    }
    
    public buyNexus(ttValue: string, markup: string): number {
        return this._stackableMU(ttValue, markup, 'Buy FN', FN_COLUMN, 'F', 100)
    }
    
    public buyME(ttValue: string, markup: string): number {
        return this._stackableMU(ttValue, markup, 'Buy ME', ME_COLUMN, 'C', 10000)
    }
    
    public buyLME(ttValue: string, markup: string): number {
        return this._stackableMU(ttValue, markup, 'Buy LME', LME_COLUMN, 'D', 10000)
    }

    public buyNB(ttValue: string, markup: string): number {
        return this._stackableMU(ttValue, markup, 'Buy NB', NB_COLUMN, 'E', 100)
    }
    
    public buyDiluted(ttValue: string, markup: string): number {
        return this._stackableMU(ttValue, markup, 'Buy DW', DW_COLUMN, 'J', 100)
    }

    public buySweetstuff(ttValue: string, markup: string): number {
        return this._stackableMU(ttValue, markup, 'Buy SS', SS_COLUMN, 'G', 100)
    }

    public buySweat(price: string, amount: string): number {
        return this._stackableK(price, amount, 'Buy SW', SW_COLUMN, 'I')
    }

    public buyFruit(price: string, amount: string): number {
        return this._stackableK(price, amount, 'Buy FT', FT_COLUMN, 'H')
    }
    
    private _refine(amount: string, title: string, meColumn: number, fnColumn: number, swColumn: number, letter: string, multi: number): number {
        const row1 = this.row + 1
        this.sheet.getCell(this.row, meColumn).value = `=-${letter}${row1}*${multi.toLocaleString('es-UY')}`
        this.sheet.getCell(this.row, fnColumn).value = `=${letter}${row1}`
        this.sheet.getCell(this.row, swColumn).value = -Number(amount)
        return this._fillRow(title, `=${letter}${row1}/1000*0,15`)
    }
    
    public refineME(amount: string): number {
        return this._refine(amount, 'Refine', ME_COLUMN, FN_COLUMN, SW_COLUMN, 'I', 100.1)
    }
    
    public refineLME(amount: string): number {
        return this._refine(amount, 'RefineL', LME_COLUMN, FN_COLUMN, DW_COLUMN, 'J', 200)
    }

    public refineNB(amount: string): number {
        return this._refine(amount, 'RefineN', NB_COLUMN, SS_COLUMN, FT_COLUMN, 'H', 1.001)
    }

    private _use(amount: string, markup: string, title: string, meColumn: number, letter: string, pedAmount: number): number {
        const row1 = this.row + 1
        const markupS = markup.replace('.', ',')
        this.sheet.getCell(this.row, meColumn).value = -Number(amount)
        return this._fillRow(title, `=-${letter}${row1}/${pedAmount}*${markupS}`)
    }

    public useME(amount: string, markup: string): number {
        return this._use(amount, markup, 'Use ME', ME_COLUMN, 'C', 10000)
    }

    public useLME(amount: string, markup: string): number {
        return this._use(amount, markup, 'Use LME', LME_COLUMN, 'D', 10000)
    }
    
    public useNB(amount: string, markup: string): number {
        return this._use(amount, markup, 'Use NB', NB_COLUMN, 'E', 100)
    }
}

export {
    MELogSheet
}
