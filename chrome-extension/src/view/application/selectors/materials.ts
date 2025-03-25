import { MaterialsMap, MaterialsState, MaterialState } from "../state/materials"

export const getMaterial = (material: string) => (state: any): MaterialState => getMaterialsMap(state)[material]
export const getMaterialsMap = (state: any): MaterialsMap => getMaterials(state).map
export const getMaterials = (state: any): MaterialsState => state.materials
