import { TTServiceState } from "../state/ttService"

export const getTTService = (state: any): TTServiceState => state.ttService
export const getTTServiceItemValues = (state: any): {[name: string]: number} => getTTService(state).c?.itemInventoryValue
