import { InventoryState } from "../state/inventory"

export const getInventory = (state: any): InventoryState => state.inventory
export const getVisibleInventory = (state: any) => getInventory(state).visible
export const getHiddenInventory = (state: any) => getInventory(state).hidden
export const getByStoreInventory = (state: any) => getInventory(state).byStore
export const getVisibleInventoryItem = (index: number) => (state: any) => getVisibleInventory(state).showList.items[index]
export const getHiddenInventoryItem = (index: number) => (state: any) => getHiddenInventory(state).showList.items[index]
export const getByStoreInventoryStaredItem = (index: number) => (state: any) => getByStoreInventory(state).flat.stared[index]
