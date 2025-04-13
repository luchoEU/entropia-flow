import { ItemsMap, ItemsState, ItemState } from "../state/items"

export const getItem = (item: string) => (state: any): ItemState => getItemsMap(state)[item]
export const getItemsMap = (state: any): ItemsMap => getItems(state).map
export const getItems = (state: any): ItemsState => state.items
