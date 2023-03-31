import { materialMap } from "../helpers/materials"

export const getCalculator = state => state.calculator
export const getCalculatorIn = state => state.calculator.in
export const getCalculatorOutME = state => state.calculator.out.me
export const getCalculatorOutLME = state => state.calculator.out.lme
export const getCalculatorOutNB = state => state.calculator.out.nb
export const getCalculatorOut = material => state => state.calculator.out[materialMap[material]]