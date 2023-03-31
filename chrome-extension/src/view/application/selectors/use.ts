import { materialMap } from "../helpers/materials"

export const getOneUse = material => state => state.use[materialMap[material]]
export const getUse = state => state.use
