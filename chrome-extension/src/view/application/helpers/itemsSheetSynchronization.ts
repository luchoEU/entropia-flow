import { ItemsSheet } from "../../services/api/sheets/sheetsItems"
import { STAGE_INITIALIZING } from "../../services/api/sheets/sheetsStages"
import { SettingsState } from "../state/settings"
import { ItemsState } from "../state/items"
import { ItemsMap } from "../state/items"

export interface ItemsSheetInterfaceCallbacks {
    setStage: (stage: number) => void
    getItemsSheet: (settings: SettingsState) => Promise<ItemsSheet>
}

export async function syncItemsToSheet(
    settings: SettingsState,
    itemsState: ItemsState,
    callbacks: ItemsSheetInterfaceCallbacks
) {
    try {
        const sheet: ItemsSheet = await callbacks.getItemsSheet(settings)

        // Sync all items to the sheet
        await sheet.clearAndSyncItems(itemsState.map)

        callbacks.setStage(STAGE_INITIALIZING)
    } catch (error) {
        console.error('Failed to sync items to sheet:', error)
        callbacks.setStage(STAGE_INITIALIZING)
    }
}

export async function reloadItemsFromSheet(
    settings: SettingsState,
    callbacks: ItemsSheetInterfaceCallbacks
): Promise<ItemsMap> {
    try {
        const sheet: ItemsSheet = await callbacks.getItemsSheet(settings)

        // Read all items from the sheet
        const itemsMap = await sheet.readItemsFromSheet()

        callbacks.setStage(STAGE_INITIALIZING)
        return itemsMap
    } catch (error) {
        console.error('Failed to reload items from sheet:', error)
        callbacks.setStage(STAGE_INITIALIZING)
        throw error
    }
}
