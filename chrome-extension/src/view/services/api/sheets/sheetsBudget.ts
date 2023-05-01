import { SetStage } from './sheetsStages'
import { createBudgetSheet, getBudgetSheet, getLastRow, hasBudgetSheet, saveUpdatedCells, setDayDate } from './sheetsUtils'

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
const TOTAL_MU_ROW = 4
const TOTAL_ROW = 5
const START_ROW = 6

interface BudgetSheetGetInfo {
    total: number
    peds: number
    materials: { [name: string] : {
        unitValue: number
        markup: number
        current: number
        total: number
    }}
}

interface BudgetInfoData {
    itemName: string
    materials: {
        name: string
        unitValue: number
    }[]
}

interface BudgetLineData {
    reason: string
    ped?: number
    materials: {
        name: string
        quantity: number
    }[]
}

class BudgetSheet {
    private setStage: SetStage
    private sheet: any
    private row: number

    constructor(setStage: SetStage) {
        this.setStage = setStage
    }

    public async save(): Promise<void> {
        await saveUpdatedCells(this.sheet, this.setStage)
        this.row = await this.getLastRow()
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
            this.sheet.getCell(CURRENT_ROW, column).formula = `=SUM(${cell.a1Column}${START_ROW+1}:${cell.a1Column})`
            this.sheet.getCell(TOTAL_MU_ROW, column).formula = `=${cell.a1Column}${UNIT_VALUE_ROW+1}*(${cell.a1Column}${MARKUP_ROW+1}-1)*${cell.a1Column}${CURRENT_ROW+1}`
            this.sheet.getCell(TOTAL_MU_ROW, column).numberFormat = { type: 'NUMBER', pattern: '0.00' }
            this.sheet.getCell(TOTAL_ROW, column).formula = `=${cell.a1Column}${UNIT_VALUE_ROW+1}*${cell.a1Column}${MARKUP_ROW+1}*${cell.a1Column}${CURRENT_ROW+1}`
            this.sheet.getCell(TOTAL_ROW, column).numberFormat = { type: 'NUMBER', pattern: '0.00' }
        }
    }

    public async create(doc: any, data: BudgetInfoData) {
        this.sheet = await createBudgetSheet(doc, this.setStage, data.itemName, TOTAL_ROW + 1, MATERIAL_COLUMN + data.materials.length)

        this.addTitle(DATE_COLUMN, 'Date', undefined)
        this.addTitle(BUDGET_COLUMN, 'Budget', undefined)
        this.addTitle(CHANGE_COLUMN, 'Change', undefined)
        this.addTitle(REASON_COLUMN, 'Reason', undefined)
        this.sheet.getCell(UNIT_VALUE_ROW, REASON_COLUMN).value = 'Unit Value'
        this.sheet.getCell(MARKUP_ROW, REASON_COLUMN).value = 'Markup'
        this.sheet.getCell(CURRENT_ROW, REASON_COLUMN).value = 'Current'
        this.sheet.getCell(TOTAL_MU_ROW, REASON_COLUMN).value = 'Total MU'
        this.sheet.getCell(TOTAL_ROW, REASON_COLUMN).value = 'Total'
        this.addTitle(PED_COLUMN, 'PED', 1)

        let column = MATERIAL_COLUMN
        for (const m of data.materials)
            this.addTitle(column++, m.name, m.unitValue)

        const firstLetter = this.sheet.getCell(0, PED_COLUMN).a1Column
        const lastLetter = this.sheet.getCell(0, column-1).a1Column
        this.sheet.getCell(TOTAL_MU_ROW, BUDGET_COLUMN).formula = `=SUM(${firstLetter}${TOTAL_MU_ROW+1}:${lastLetter}${TOTAL_MU_ROW+1})`
        this.sheet.getCell(TOTAL_ROW, BUDGET_COLUMN).formula = `=SUM(${firstLetter}${TOTAL_ROW+1}:${lastLetter}${TOTAL_ROW+1})`

        this.row = START_ROW
        this.sheet.getCell(START_ROW, REASON_COLUMN).value = 'Start'
        await this.addBudget(START_ROW)
        this.addDate() // after addBudget because it loads the empty cells
        await this.sheet.saveUpdatedCells()
    }

    private addDate() {
        setDayDate(this.sheet, this.row, DATE_COLUMN, 'A')
    }

    public async hasPage(doc: any, itemName: string): Promise<boolean> {
        return await hasBudgetSheet(doc, this.setStage, itemName)
    }

    public async load(doc: any, itemName: string): Promise<boolean> {
        this.sheet = await getBudgetSheet(doc, this.setStage, itemName)
        if (this.sheet !== undefined) {
            this.row = await this.getLastRow()
        }
        return this.sheet !== undefined
    }

    public async getInfo(): Promise<BudgetSheetGetInfo> {
        const sheet = this.sheet
        const info: BudgetSheetGetInfo = {
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

    private async addBudget(row: number): Promise<void> {
        // to use the budget sum
        await this.sheet.saveUpdatedCells()
        await this.sheet.loadCells()

        this.sheet.getCell(row, BUDGET_COLUMN).value = this.sheet.getCell(TOTAL_ROW, BUDGET_COLUMN).value
        this.sheet.getCell(row, BUDGET_COLUMN).numberFormat = { type: 'NUMBER', pattern: '0.00' }
        if (row > START_ROW) {
            const column = this.sheet.getCell(0, BUDGET_COLUMN).a1Column
            this.sheet.getCell(row, CHANGE_COLUMN).formula = `=${column}${row+1}-${column}${row}`
            this.sheet.getCell(row, CHANGE_COLUMN).numberFormat = { type: 'NUMBER', pattern: '0.00' }
        }
    }

    public async addLine(d: BudgetLineData): Promise<void> {
        this.addDate()
        this.sheet.getCell(this.row, REASON_COLUMN).value = d.reason

        if (d.ped !== undefined) {
            this.sheet.getCell(this.row, PED_COLUMN).value = d.ped
            this.sheet.getCell(this.row, PED_COLUMN).numberFormat = { type: 'NUMBER', pattern: '0.00' }
        }

        for (let column = PED_COLUMN; column < this.sheet.columnCount; column++) {
            const titleName = this.sheet.getCell(TITLE_ROW, column).value
            const material = d.materials.find(m => m.name === titleName)
            if (material !== undefined && material.quantity !== 0) {
                this.sheet.getCell(this.row, column).value = material.quantity
                if (column === PED_COLUMN) {
                    this.sheet.getCell(this.row, PED_COLUMN).numberFormat = { type: 'NUMBER', pattern: '0.00' }
                }
            }
        }
        await this.addBudget(this.row)
        this.row++
    }

    public async addBuyMaterial(materialName: string, materialQuantity: number, ped: number, reason: string): Promise<void> {
        await this.addLine({
            reason,
            ped,
            materials: [{
                name: materialName,
                quantity: materialQuantity
            }]
        })
        for (let column = MATERIAL_COLUMN; column < this.sheet.columnCount; column++) {
            const titleName = this.sheet.getCell(TITLE_ROW, column).value
            if (materialName === titleName) {
                const unitValue = this.sheet.getCell(UNIT_VALUE_ROW, column).value
                this.sheet.getCell(MARKUP_ROW, column).value = -ped / (materialQuantity * unitValue)
                break
            }
        }
    }
}

export {
    BudgetSheet,
    BudgetSheetGetInfo,
    BudgetInfoData,
    BudgetLineData,
}
