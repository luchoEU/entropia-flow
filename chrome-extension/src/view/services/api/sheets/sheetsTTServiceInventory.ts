import { TTServiceSheetItem } from '../../../application/state/ttService'
import { SetStage } from './sheetsStages'
import { getLastRow, getSheetUrl, getTTServiceInventorySheet } from './sheetsUtils'

const DATE_COLUMN = 0
const PLAYER_COLUMN = 1
const ITEM_COLUMN = 2
const QUANTITY_COLUMN = 3
const VALUE_COLUMN = 4
const START_ROW = 1 // first are column titles

class TTServiceInventorySheet {
    private setStage: SetStage
    private sheet: any

    constructor(setStage: SetStage) {
        this.setStage = setStage;
    }

    public url(): string {
        return getSheetUrl(this.sheet)
    }

    public async load(doc: any): Promise<boolean> {
        this.sheet = await getTTServiceInventorySheet(doc, this.setStage);
        return this.sheet !== undefined;
    }

    public async readTable(): Promise<Array<TTServiceSheetItem>> {
        if (this.sheet === undefined) return undefined
        await this.sheet.loadCells()

        const rows: TTServiceSheetItem[] = []
        const lastRow = getLastRow(this.sheet, DATE_COLUMN)
        for (let i = START_ROW; i < lastRow; i++) {
            if (this.sheet.getCell(i, DATE_COLUMN).value === null) continue
            rows.push({
                date: this.sheet.getCell(i, DATE_COLUMN).formattedValue,
                player: this.sheet.getCell(i, PLAYER_COLUMN).value,
                name: this.sheet.getCell(i, ITEM_COLUMN).value,
                quantity: this.sheet.getCell(i, QUANTITY_COLUMN).value,
                value: this.sheet.getCell(i, VALUE_COLUMN).value
            })
        }
        return rows
    }
}

export {
    TTServiceInventorySheet
}
