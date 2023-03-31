import { materialMap } from "../helpers/materials"

export const getOneStackableIn = material => state => state.stackable.in[materialMap[material]]
export const getOneStackableOut = material => state => state.stackable.out[materialMap[material]]
export const getStackableIn = state => state.stackable.in