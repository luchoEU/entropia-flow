import { materialMap } from "../helpers/materials"
import { RefineOneState, RefineState } from "../state/refine"

export const getOneRefine = (material: string) => (state: any): RefineOneState => getRefine(state)[materialMap[material]]
export const getRefine = (state: any): RefineState => state.refine
