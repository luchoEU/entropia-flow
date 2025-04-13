import { refinedMap } from "../helpers/items"
import { StackableOneStateIn, StackableOneStateOut, StackableStateIn } from "../state/stackable"

export const getOneStackableIn = (material: string) => (state: any): StackableOneStateIn => state.stackable.in[refinedMap[material]]
export const getOneStackableOut = (material: string) => (state: any): StackableOneStateOut => state.stackable.out[refinedMap[material]]
export const getStackableIn = (state: any): StackableStateIn => state.stackable.in
