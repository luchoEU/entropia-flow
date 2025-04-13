import { refinedMap } from "../helpers/items"
import { RefineOneState, RefineState } from "../state/refine"

export const getOneRefine = (material: string) => (state: any): RefineOneState => getRefine(state)[refinedMap[material]]
export const getRefine = (state: any): RefineState => state.refine
