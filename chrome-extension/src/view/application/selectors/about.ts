import { AboutState } from "../state/about";

export const getAbout = (state: any): AboutState => state.about
export const isExpanded = (part: string) => (state: any): boolean => state.about.expanded.includes(part)
