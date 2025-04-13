import { refinedMap } from "../helpers/items"
import { CalculatorState, CalculatorStateIn, CalculatorStateOut1 } from "../state/calculator"

export const getCalculator = (state: any): CalculatorState => state.calculator
export const getCalculatorIn = (state: any): CalculatorStateIn => getCalculator(state).in
export const getCalculatorOutME = (state: any): CalculatorStateOut1 => getCalculator(state).out.me
export const getCalculatorOutLME = (state: any): CalculatorStateOut1 => getCalculator(state).out.lme
export const getCalculatorOutNB = (state: any): CalculatorStateOut1 => getCalculator(state).out.nb
export const getCalculatorOut = (material: string) => (state: any): CalculatorStateOut1 => getCalculator(state).out[refinedMap[material]]
