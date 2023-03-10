import { BlueprintData } from "../../../application/state/craft"
import { SetStage } from "./sheetsStages"
import { createBudgetSheet, getBudgetSheet, getInventorySheet, saveUpdatedCells } from "./sheetsUtils"

const DATE_COLUMN = 0
const BUDGET_COLUMN = 1
const REASON_COLUMN = 2
const BLUEPRINT_COLUMN = 3
const ITEM_COLUMN = 4
const PED_COLUMN = 5
const MATERIAL_COLUMN = 6

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
        const cell = this.sheet.getCell(0, column)
        cell.value = title
        cell.backgroundColor = { blue: 1 }
        cell.textFormat = { foregroundColor: { red: 1, green: 1, blue: 1 } }

        if (unitValue !== undefined) {
            this.sheet.getCell(1, column).value = unitValue
            this.sheet.getCell(2, column).value = 1
            this.sheet.getCell(2, column).numberFormat = { type: 'PERCENT', pattern: '0.00%' }
            this.sheet.getCell(3, column).formula = `=SUM(${cell.a1Column}6:${cell.a1Column})`
            this.sheet.getCell(4, column).formula = `=${cell.a1Column}2*${cell.a1Column}3*${cell.a1Column}4`
            this.sheet.getCell(4, column).numberFormat = { type: 'NUMBER', pattern: '0.00' }
        }
    }

    public async create(doc: any) {
        this.sheet = await createBudgetSheet(doc, this.setStage, this.data.itemName, MATERIAL_COLUMN + this.data.info.materials.length)

        this.addTitle(DATE_COLUMN, "Date", undefined)
        this.addTitle(BUDGET_COLUMN, "Budget", undefined)
        this.addTitle(REASON_COLUMN, "Reason", undefined)
        this.sheet.getCell(1, REASON_COLUMN).value = "Unit Value"
        this.sheet.getCell(2, REASON_COLUMN).value = "Markup"
        this.sheet.getCell(3, REASON_COLUMN).value = "Current"
        this.sheet.getCell(4, REASON_COLUMN).value = "Total"
        this.addTitle(BLUEPRINT_COLUMN, "Blueprint", 0.01)
        this.addTitle(ITEM_COLUMN, "Item", Number(this.data.info.itemValue))
        this.addTitle(PED_COLUMN, "PED", 1)

        let column = MATERIAL_COLUMN
        for (const m of this.data.info.materials)
            this.addTitle(column++, m.name, Number(m.value))

        this.sheet.getCell(4, BUDGET_COLUMN).formula = `=SUM(D5:${this.sheet.getCell(0, column-1).a1Column}5)`
    }

    public async load(doc: any): Promise<boolean> {
        this.sheet = getBudgetSheet(doc, this.setStage, this.data.itemName)
        return this.sheet !== undefined
    }
}

export {
    BudgetSheet
}
