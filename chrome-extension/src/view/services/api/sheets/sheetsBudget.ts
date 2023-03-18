import { itemNameFromString } from '../../../application/helpers/craft'
import { BlueprintData } from '../../../application/state/craft'
import { SetStage } from './sheetsStages'
import { createBudgetSheet, DATE_FORMAT, getBudgetSheet, getLastRow, hasBudgetSheet, saveUpdatedCells } from './sheetsUtils'

const DATE_COLUMN = 0
const BUDGET_COLUMN = 1
const CHANGE_COLUMN = 2
const REASON_COLUMN = 3
const PED_COLUMN = 4
const MATERIAL_COLUMN = 5

const TITLE_ROW = 0
const UNIT_VALUE_ROW = 1
const MARKUP_ROW = 2
const CURRENT_ROW = 3
const TOTAL_ROW = 4
const START_ROW = 5

interface BudgetSheetInfo {
    total: number
    peds: number
    materials: { [name: string] : {
        unitValue: number
        markup: number
        current: number
        total: number
    }}
}

class BudgetSheet {
    private data: BlueprintData
    private setStage: SetStage
    private sheet: any

    constructor(data: BlueprintData, setStage: SetStage) {
        this.data = data
        this.setStage = setStage
    }

    public async save(): Promise<void> {
        await saveUpdatedCells(this.sheet, this.setStage)
    }

    private addTitle(column: number, title: string, unitValue: number) {
        const cell = this.sheet.getCell(TITLE_ROW, column)
        cell.value = title
        cell.backgroundColor = { blue: 1 }
        cell.textFormat = { foregroundColor: { red: 1, green: 1, blue: 1 } }

        if (unitValue !== undefined) {
            this.sheet.getCell(UNIT_VALUE_ROW, column).value = unitValue
            this.sheet.getCell(MARKUP_ROW, column).value = 1
            this.sheet.getCell(MARKUP_ROW, column).numberFormat = { type: 'PERCENT', pattern: '0.00%' }
            this.sheet.getCell(CURRENT_ROW, column).formula = `=SUM(${cell.a1Column}6:${cell.a1Column})`
            this.sheet.getCell(TOTAL_ROW, column).formula = `=${cell.a1Column}2*${cell.a1Column}3*${cell.a1Column}4`
            this.sheet.getCell(TOTAL_ROW, column).numberFormat = { type: 'NUMBER', pattern: '0.00' }
        }
    }

    public async create(doc: any) {
        this.sheet = await createBudgetSheet(doc, this.setStage, this.data.itemName, MATERIAL_COLUMN + this.data.info.materials.length)

        this.addTitle(DATE_COLUMN, 'Date', undefined)
        this.addTitle(BUDGET_COLUMN, 'Budget', undefined)
        this.addTitle(CHANGE_COLUMN, 'Change', undefined)
        this.addTitle(REASON_COLUMN, 'Reason', undefined)
        this.sheet.getCell(UNIT_VALUE_ROW, REASON_COLUMN).value = 'Unit Value'
        this.sheet.getCell(MARKUP_ROW, REASON_COLUMN).value = 'Markup'
        this.sheet.getCell(CURRENT_ROW, REASON_COLUMN).value = 'Current'
        this.sheet.getCell(TOTAL_ROW, REASON_COLUMN).value = 'Total'
        this.addTitle(PED_COLUMN, 'PED', 1)

        let column = MATERIAL_COLUMN
        for (const m of this.data.info.materials)
            this.addTitle(column++, m.name, Number(m.value))

        this.sheet.getCell(TOTAL_ROW, BUDGET_COLUMN).formula = `=SUM(E5:${this.sheet.getCell(0, column-1).a1Column}5)`

        this.sheet.getCell(START_ROW, REASON_COLUMN).value = 'Start'
        await this.addDate(START_ROW)
        await this.addBudget(START_ROW)
    }

    public async hasPage(doc: any): Promise<boolean> {
        return await hasBudgetSheet(doc, this.setStage, this.data.itemName)
    }

    public async load(doc: any): Promise<boolean> {
        this.sheet = await getBudgetSheet(doc, this.setStage, this.data.itemName)
        return this.sheet !== undefined
    }

    public async getInfo(): Promise<BudgetSheetInfo> {
        const sheet = this.sheet
        const info: BudgetSheetInfo = {
            total: Number(sheet.getCell(TOTAL_ROW, BUDGET_COLUMN).value),
            peds: Number(sheet.getCell(TOTAL_ROW, PED_COLUMN).value),
            materials: {}
        }
        for (let column = MATERIAL_COLUMN; column < sheet.columnCount; column++) {
            const get = (row: number) => sheet.getCell(row, column).value
            info.materials[get(TITLE_ROW)] = {
                unitValue: Number(get(UNIT_VALUE_ROW)),
                markup: Number(get(MARKUP_ROW)),
                current: Number(get(CURRENT_ROW)),
                total: Number(get(TOTAL_ROW)),
            }
        }
        return info
    }

    private async getLastRow(): Promise<number> {
        return Math.max(START_ROW, getLastRow(this.sheet, DATE_COLUMN) + 1)
    }

    private async addDate(row: number): Promise<void> {
        const d = new Date()
        this.sheet.getCell(row, DATE_COLUMN).formula = `=DATEVALUE("${d.getDate()}/${(d.getMonth() + 1)}/${d.getFullYear()}")`
        this.sheet.getCell(row, DATE_COLUMN).numberFormat = DATE_FORMAT
    }

    private async addBudget(row: number): Promise<void> {
        // to use the budget sum
        await this.sheet.saveUpdatedCells()
        await this.sheet.loadCells()

        this.sheet.getCell(row, BUDGET_COLUMN).value = this.sheet.getCell(TOTAL_ROW, BUDGET_COLUMN).value
        this.sheet.getCell(row, BUDGET_COLUMN).numberFormat = { type: 'NUMBER', pattern: '0.00' }
        if (row > START_ROW) {
            this.sheet.getCell(row, CHANGE_COLUMN).formula = `=B${row+1}-B${row}`
            this.sheet.getCell(row, CHANGE_COLUMN).numberFormat = { type: 'NUMBER', pattern: '0.00' }
        }
    }

    public async addCraftSession(): Promise<void> {
        const row = await this.getLastRow()
        await this.addDate(row)
        this.sheet.getCell(row, REASON_COLUMN).value = 'Craft'
        for (let column = MATERIAL_COLUMN; column < this.sheet.columnCount; column++) {
            const titleName = this.sheet.getCell(TITLE_ROW, column).value
            const name = itemNameFromString(this.data, titleName)
            const material = this.data.session.diffMaterials.find(m => m.n === name)
            if (material !== undefined && material.q !== 0)
                this.sheet.getCell(row, column).value = material.q
        }
        await this.addBudget(row)
    }

    public async addBuyMaterial(materialName: string, materialQuantity: number, pedCost: number): Promise<void> {
        const row = await this.getLastRow()
        await this.addDate(row)

        this.sheet.getCell(row, REASON_COLUMN).value = materialQuantity > 0 ? 'Buy' : 'Sell'        
        this.sheet.getCell(row, PED_COLUMN).value = -pedCost
        for (let column = MATERIAL_COLUMN; column < this.sheet.ColumnCount; column++) {
            const name = this.sheet.getCell(TITLE_ROW, column).value
            if (name == materialName) {
                this.sheet.getCell(row, column).value = materialQuantity
                break
            }
        }
        await this.addBudget(row)
    }
}

export {
    BudgetSheet,
    BudgetSheetInfo,
}
