import { BlueprintData } from "../../../application/state/craft"
import { SetStage } from "./sheetsStages"
import { createBudgetSheet, getBudgetSheet, getDaysSinceLastEntry, getInventorySheet, getLastRow, hasBudgetSheet, saveUpdatedCells } from "./sheetsUtils"

const DATE_COLUMN = 0
const BUDGET_COLUMN = 1
const REASON_COLUMN = 2
const PED_COLUMN = 3
const MATERIAL_COLUMN = 4

const TITLE_ROW = 0
const UNIT_VALUE_ROW = 1
const MARKUP_ROW = 2
const CURRENT_ROW = 3
const TOTAL_ROW = 4

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

        this.addTitle(DATE_COLUMN, "Date", undefined)
        this.addTitle(BUDGET_COLUMN, "Budget", undefined)
        this.addTitle(REASON_COLUMN, "Reason", undefined)
        this.sheet.getCell(UNIT_VALUE_ROW, REASON_COLUMN).value = "Unit Value"
        this.sheet.getCell(MARKUP_ROW, REASON_COLUMN).value = "Markup"
        this.sheet.getCell(CURRENT_ROW, REASON_COLUMN).value = "Current"
        this.sheet.getCell(TOTAL_ROW, REASON_COLUMN).value = "Total"
        this.addTitle(PED_COLUMN, "PED", 1)

        let column = MATERIAL_COLUMN
        for (const m of this.data.info.materials)
            this.addTitle(column++, m.name, Number(m.value))

        this.sheet.getCell(4, BUDGET_COLUMN).formula = `=SUM(D5:${this.sheet.getCell(0, column-1).a1Column}5)`
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

    public async addCraftSession(): Promise<void> {
        const row = Math.max(5, getLastRow(this.sheet) + 1)
        if (row > 5) {
            const daysSinceLastEntry = getDaysSinceLastEntry(this.sheet, row - 1, DATE_COLUMN)
            this.sheet.getCell(row, DATE_COLUMN).formula = `=A${row}+${daysSinceLastEntry}`
            this.sheet.getCell(row - 1, BUDGET_COLUMN).value = this.sheet.getCell(TOTAL_ROW, BUDGET_COLUMN).value
        } else {
            const d = new Date()
            const s = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear() % 100}`
            this.sheet.getCell(row, DATE_COLUMN).value = s
        }

        this.sheet.getCell(row, REASON_COLUMN).value = 'Craft'
        for (let column = MATERIAL_COLUMN; column < this.sheet.ColumnCount; column++) {
            const name = this.sheet.getCell(TITLE_ROW, column).value
            const materialAfter = this.data.info.materials.find(m => m.name === name)
            const materialBefore = this.data.session.startMaterials.find(m => m.n === name)
            this.sheet.getCell(row, column).value = materialAfter.quantity - materialBefore.q
        }
    }
}

export {
    BudgetSheet,
    BudgetSheetInfo,
}
