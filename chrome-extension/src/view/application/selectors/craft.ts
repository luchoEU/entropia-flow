export const getCraft = state => state.craft
export const getActiveBlueprintItem = (index: number) => (state: any) => getCraft(state).c.filteredBluprints[index]