import { InventoryByStore, InventoryListWithFilter, InventoryState, ItemHidden, ItemVisible, TradeItemData } from "../state/inventory"

export const getInventory = (state: any): InventoryState => state.inventory
export const getHiddenInventory = (state: any): InventoryListWithFilter<ItemHidden> => getInventory(state).hidden
export const getByStoreInventory = (state: any): InventoryByStore => getInventory(state).byStore
export const getTradeItemDataChain = (state: any): TradeItemData[] => getInventory(state).tradeItemDataChain
export const getHiddenInventoryItem = (index: number) => (state: any) => getHiddenInventory(state).showList.items[index]
export const getByStoreInventoryItem = (index: number) => (state: any) => getByStoreInventory(state).flat.show[index]
export const getByStoreInventoryStaredItem = (index: number) => (state: any) => getByStoreInventory(state).flat.stared[index]
export const getByStoreInventoryCraftItem = (index: number) => (state: any) => getByStoreInventory(state).flat.craft[index]
export const getTradeFavoriteBlueprintItem = (chainIndex: number) => (index: number) => (state: any) => getTradeItemDataChain(state)[chainIndex].c.favoriteBlueprints[index]
export const getTradeOwnedBlueprintItem = (chainIndex: number) => (index: number) => (state: any) => getTradeItemDataChain(state)[chainIndex].c.ownedBlueprints[index]
export const getTradeOtherBlueprintItem = (chainIndex: number) => (index: number) => (state: any) => getTradeItemDataChain(state)[chainIndex].c.otherBlueprints[index]
