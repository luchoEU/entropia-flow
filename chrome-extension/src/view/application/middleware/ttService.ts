import { loadFrom } from "../../../web/loader";
import { ISheetSource, SourceLoadResponse } from "../../../web/sources";
import { SetStage } from "../../services/api/sheets/sheetsStages";
import { TTServiceInventorySheet } from "../../services/api/sheets/sheetsTTServiceInventory";
import { LOAD_TT_SERVICE, setTTServicePartialWebData } from "../actions/ttService"
import { getSettings } from "../selectors/settings";
import { FEATURE_TT_SERVICE_RELOAD, isFeatureEnabled, SettingsState, SheetAccessInfo } from "../state/settings";
import { TTServiceInventoryWebData } from "../state/ttService";

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action: any) => {
    await next(action)
    switch (action.type) {
        case LOAD_TT_SERVICE: {
            const settings: SettingsState = getSettings(getState());
            if (!isFeatureEnabled(FEATURE_TT_SERVICE_RELOAD, settings)) break;

            const source: ISheetSource = new SheetSource(api, settings.sheet)
            for await (const r of loadFrom([source], s => s.loadTTServiceInventory())) {
                dispatch(setTTServicePartialWebData({ inventory: r }))
            }
            break
        }
    }
}

class SheetSource implements ISheetSource {
    public constructor(public api: any, public sheet: SheetAccessInfo) { }

    public name: string = "Google Sheets";
    public stage: number = undefined;

    public async loadTTServiceInventory(): Promise<SourceLoadResponse<TTServiceInventoryWebData>> {
        const setStage: SetStage = (stage: number) => { this.stage = stage }
        const sheet: TTServiceInventorySheet = await this.api.sheets.loadTTServiceInventorySheet(this.sheet, setStage)
        if (!sheet)
            return { ok: false, errorText: 'Load sheet error' }

        const data = await sheet.readTable()
        return data ? { ok: true, data, url: sheet.url() } : { ok: false, errorText: 'Read table error' }
    }
}

export default [
    requests
]
