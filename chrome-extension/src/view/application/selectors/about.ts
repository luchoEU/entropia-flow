export const getAbout = state => state.about
export const isExpanded = (part: string) => state => state.about.expanded.includes(part)