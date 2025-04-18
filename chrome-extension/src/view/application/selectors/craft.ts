import { CraftState } from "../state/craft"

export const getCraft = (state: any): CraftState => state.craft
export const getStaredBlueprintItem = (index: number) => (state: any) => getCraft(state).c.filteredStaredBlueprints[index]
export const isBlueprintStared = (name: string) => (state: any) => getCraft(state).stared.list.includes(name)
