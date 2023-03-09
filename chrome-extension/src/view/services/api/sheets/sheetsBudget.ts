import { SetStage } from "../../../application/state/actives"
import { BlueprintData } from "../../../application/state/craft"

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

    private addTitle(column: number, title: string, unitValue: string) {
        const cell = this.sheet.getCell(0, column)
        cell.value = title
        cell.backgroundColor = { blue: 1 }
        cell.textFormat = { foregroundColor: { red: 1, green: 1, blue: 1 } }

        if (unitValue !== undefined) {
            this.sheet.getCell(1, column).value = unitValue
            this.sheet.getCell(2, column).value = "100%"
            this.sheet.getCell(3, column).formula = `=SUM(${cell.a1Column}6:${cell.a1Column})`
            this.sheet.getCell(4, column).formula = `=${cell.a1Column}2*${cell.a1Column}3*${cell.a1Column}4`
            this.sheet.getCell(4, column).numberFormat = { type: 'NUMBER', pattern: '0.00' }
        }
    }

    public async create(doc: any) {
        const x = doc.sheetsByTitle["MFAmp5ef"]
        await x.loadCells()
        const y = x.getCell(4, 1)

        this.sheet = await doc.addSheet()
        const title = this.data.itemName + " - Entropia Flow"
        await this.sheet.updateProperties({ title, gridProperties: { rowCount: 1000, columnCount: MATERIAL_COLUMN + this.data.materials.length, frozenRowCount: 5 } })
        await this.sheet.loadCells()

        this.addTitle(DATE_COLUMN, "Date", undefined)
        this.addTitle(BUDGET_COLUMN, "Budget", undefined)
        this.addTitle(REASON_COLUMN, "Reason", undefined)
        this.sheet.getCell(1, REASON_COLUMN).value = "Unit Value"
        this.sheet.getCell(2, REASON_COLUMN).value = "Markup"
        this.sheet.getCell(3, REASON_COLUMN).value = "Current"
        this.sheet.getCell(4, REASON_COLUMN).value = "Total"
        this.addTitle(BLUEPRINT_COLUMN, "Blueprint", "0,01")
        this.addTitle(ITEM_COLUMN, "Item", this.data.itemValue.replace('.', ','))
        this.addTitle(PED_COLUMN, "PED", "1")

        let column = MATERIAL_COLUMN
        for (const m of this.data.materials)
            this.addTitle(column++, m.name, m.value.replace('.', ','))

        this.sheet.getCell(4, BUDGET_COLUMN).formula = `=SUM(D5:${this.sheet.getCell(0, column-1).a1Column}5)`

        await this.sheet.saveUpdatedCells();
    }
}

export {
    BudgetSheet
}
