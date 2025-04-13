import { refinedMap } from "../helpers/items"
import { UseOneState, UseState } from "../state/use"

export const getOneUse = (material: string) => (state: any): UseOneState => getUse(state)[refinedMap[material]]
export const getUse = (state: any): UseState => state.use
