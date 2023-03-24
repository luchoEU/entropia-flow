export const getCalculatorRefined = material => state => getOneRefined(material)(state).calculator
export const getOneRefined = material => state => state.refined.map[material]
export const getRefined = state => state.refined
