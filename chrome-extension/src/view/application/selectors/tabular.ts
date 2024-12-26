import { TabularState, TabularStateData } from "../state/tabular"

export const getTabular = (state: any): TabularState => state.tabular
export const getTabularData = (selector: string) => (state: any): TabularStateData => getTabular(state)[selector]
export const getTabularDataItem = (selector: string) => (index: number) => (state: any): any => getTabularData(selector)(state).items?.show[index]
