import { TTServiceItem } from '../../../application/state/ttService'
import { SetStage } from './sheetsStages'
import { getTTServiceInventorySheet } from './sheetsUtils'

interface TTServiceInventoryData {
    rows: Array<TTServiceItem>
}

class TTServiceInventorySheet {
    private setStage: SetStage
    private sheet: any

    constructor(setStage: SetStage) {
        this.setStage = setStage
    }

    public async load(doc: any): Promise<boolean> {
        this.sheet = await getTTServiceInventorySheet(doc, this.setStage)
        return this.sheet !== undefined
    }

    public async readTable(): Promise<TTServiceInventoryData> {
        const rows = []
        return { rows }
    }
}

export {
    TTServiceInventorySheet,
    TTServiceInventoryData
}
