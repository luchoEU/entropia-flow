import { SetStage } from './sheetsStages'
import { createItemsSheet, getItemsSheet, getLastRow, getSheetUrl, hasItemsSheet, saveUpdatedCells } from './sheetsUtils'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { ItemsMap } from '../../../application/state/items'

const NAME_COLUMN = 0
const MARKUP_COLUMN = 1
const RESERVE_COLUMN = 2
const NOTES_COLUMN = 3

const TITLE_ROW = 0
const START_ROW = 1

interface ItemsSheetRowData {
    name: string
    markup?: string
    reserve?: string
    notes?: string
}

class ItemsSheet {
    private setStage: SetStage
    private sheet: any
    private row: number | undefined
    private url: string | undefined

    constructor(setStage: SetStage) {
        this.setStage = setStage
    }

    public async save(): Promise<void> {
        await saveUpdatedCells(this.sheet, this.setStage)
        this.row = await this.getLastRow()
    }

    private addTitle(column: number, title: string) {
        const cell = this.sheet.getCell(TITLE_ROW, column)
        cell.value = title
        cell.backgroundColor = { blue: 1 }
        cell.textFormat = { foregroundColor: { red: 1, green: 1, blue: 1 } }
    }

    public async create(doc: any) {
        this.sheet = await createItemsSheet(doc, this.setStage)
        this.url = getSheetUrl(this.sheet)

        this.addTitle(NAME_COLUMN, 'Name')
        this.addTitle(MARKUP_COLUMN, 'Markup')
        this.addTitle(RESERVE_COLUMN, 'Reserve Amount')
        this.addTitle(NOTES_COLUMN, 'Notes')

        this.row = START_ROW
        await this.sheet.saveUpdatedCells()
    }

    public async hasPage(doc: GoogleSpreadsheet): Promise<boolean> {
        return await hasItemsSheet(doc, this.setStage)
    }

    public async load(doc: GoogleSpreadsheet): Promise<boolean> {
        this.sheet = await getItemsSheet(doc, this.setStage)
        if (this.sheet !== undefined) {
            this.url = getSheetUrl(this.sheet)
            this.row = await this.getLastRow()
        }
        return this.sheet !== undefined
    }

    public getUrl(): string {
        return this.url!
    }

    private async getLastRow(): Promise<number> {
        return Math.max(START_ROW, getLastRow(this.sheet, NAME_COLUMN) + 1)
    }

    public async clearAndSyncItems(itemsMap: ItemsMap): Promise<void> {
        const lastRow = await this.getLastRow()

        // Write all items from the map
        let row = START_ROW
        for (const itemName of Object.keys(itemsMap).sort()) {
            const item = itemsMap[itemName]
            const markupNum = Number(item.markup?.value)
            const reserveNum = Number(item.reserveAmount)
            this.sheet.getCell(row, NAME_COLUMN).value = itemName
            this.sheet.getCell(row, MARKUP_COLUMN).value = isNaN(markupNum) ? '' : markupNum
            this.sheet.getCell(row, MARKUP_COLUMN).numberFormat = { type: 'NUMBER', pattern: '0.00' }
            this.sheet.getCell(row, RESERVE_COLUMN).value = isNaN(reserveNum) ? '' : reserveNum
            this.sheet.getCell(row, NOTES_COLUMN).value = item.notes || ''
            row++
        }

        // Clear all data remaining rows
        while (row < lastRow) {
            for (let col = 0; col < 4; col++) {
                this.sheet.getCell(row, col).clearAllFormatting()
                this.sheet.getCell(row, col).value = null
            }
            row++
        }

        await this.save()
    }

    public async readItemsFromSheet(): Promise<ItemsMap> {
        const itemsMap: ItemsMap = {}
        const lastRow = await this.getLastRow()

        for (let row = START_ROW; row < lastRow; row++) {
            const nameCell = this.sheet.getCell(row, NAME_COLUMN).value
            if (nameCell) {
                const name = String(nameCell)
                itemsMap[name] = {
                    markup: {
                        value: this.sheet.getCell(row, MARKUP_COLUMN).value ? String(this.sheet.getCell(row, MARKUP_COLUMN).value) : undefined
                    },
                    reserveAmount: this.sheet.getCell(row, RESERVE_COLUMN).value ? String(this.sheet.getCell(row, RESERVE_COLUMN).value) : undefined,
                    notes: this.sheet.getCell(row, NOTES_COLUMN).value ? String(this.sheet.getCell(row, NOTES_COLUMN).value) : undefined
                }
            }
        }

        return itemsMap
    }
}

export {
    ItemsSheet,
    ItemsSheetRowData
}
