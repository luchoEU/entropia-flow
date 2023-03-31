import { materialMap } from "../helpers/materials"

export const getOneRefine = material => state => state.refine[materialMap[material]]
export const getRefine = state => state.refine
