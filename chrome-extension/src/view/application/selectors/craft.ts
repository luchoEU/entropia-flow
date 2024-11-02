export const getCraft = (state: any) => state.craft
export const getStaredBlueprintItem = (index: number) => (state: any) => getCraft(state).c.filteredStaredBlueprints[index]
