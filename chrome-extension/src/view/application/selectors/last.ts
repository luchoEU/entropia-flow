import { LastRequiredState, ViewPedData } from "../state/last"

export const getLast = (state: any): LastRequiredState => state.last
export const getBlacklist = (state: any): Array<string> => getLast(state).blacklist
export const getPermanentBlacklist = (state: any): Array<string> => getLast(state).permanentBlacklist
export const getPeds = (state: any): Array<ViewPedData> => getLast(state).peds
export const getAnyInventory = (state: any): boolean => getLast(state).c.anyInventory
