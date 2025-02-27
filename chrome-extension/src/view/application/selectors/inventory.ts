import { InventoryByStore, InventoryListWithFilter, InventoryState, ItemHidden, ItemVisible, TradeItemData } from "../state/inventory"

export const getInventory = (state: any): InventoryState => state.inventory
export const getVisibleInventory = (state: any): InventoryListWithFilter<ItemVisible> => getInventory(state).visible
export const getHiddenInventory = (state: any): InventoryListWithFilter<ItemHidden> => getInventory(state).hidden
export const getByStoreInventory = (state: any): InventoryByStore => getInventory(state).byStore
export const getTradeItemData = (state: any): TradeItemData => getInventory(state).tradeItemData
export const getVisibleInventoryItem = (index: number) => (state: any) => getVisibleInventory(state).showList.items[index]
export const getHiddenInventoryItem = (index: number) => (state: any) => getHiddenInventory(state).showList.items[index]
export const getByStoreInventoryItem = (index: number) => (state: any) => getByStoreInventory(state).flat.show[index]
export const getByStoreInventoryStaredItem = (index: number) => (state: any) => getByStoreInventory(state).flat.stared[index]
export const getByStoreInventoryCraftItem = (index: number) => (state: any) => getByStoreInventory(state).flat.craft[index]
export const getTradeFavoriteBlueprintItem = (index: number) => (state: any) => getTradeItemData(state).c.favoriteBlueprints[index]
export const getTradeOwnedBlueprintItem = (index: number) => (state: any) => getTradeItemData(state).c.ownedBlueprints[index]
export const getTradeOtherBlueprintItem = (index: number) => (state: any) => getTradeItemData(state).c.otherBlueprints[index]
