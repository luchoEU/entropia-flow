import { SetStage } from "../../services/api/sheets/sheetsStages"
import { TTServiceInventorySheet } from "../../services/api/sheets/sheetsTTServiceInventory"
import { RELOAD_TT_SERVICE } from "../actions/ttService"
import { getSettings } from "../selectors/settings"
import { SettingsState } from "../state/settings"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case RELOAD_TT_SERVICE: {
            const settings: SettingsState = getSettings(getState())
            const setStage: SetStage = (stage: number) => { }
            const sheet: TTServiceInventorySheet = await api.sheets.loadTTServiceInventorySheet(settings.sheet, setStage)
            if (sheet) {
                await sheet.readTable()
            }
            break;
        }
    }
}

export default [
    requests
]