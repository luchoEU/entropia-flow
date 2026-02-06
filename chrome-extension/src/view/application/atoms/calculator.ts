import { atom } from 'jotai'
import { CalculatorState } from '../state/calculator'
import {
  initialState,
  setState,
  sweatChanged,
  fruitChanged,
  nexusChanged,
  dilutedChanged,
  sweetstuffChanged,
  meMarkupChanged,
  meValueChanged,
  lmeMarkupChanged,
  lmeValueChanged,
  nbMarkupChanged,
  nbValueChanged
} from '../helpers/calculator'

export const calculatorAtom = atom<CalculatorState>(initialState)

export const setCalculatorStateAtom = atom(
  null,
  (get, set, newState: any) => {
    const updated = setState(get(calculatorAtom), newState)
    set(calculatorAtom, updated)
  }
)

export const calculatorSweatChangedAtom = atom(
  null,
  (get, set, price: string) => {
    const updated = sweatChanged(get(calculatorAtom), price)
    set(calculatorAtom, updated)
  }
)

export const calculatorFruitChangedAtom = atom(
  null,
  (get, set, price: string) => {
    const updated = fruitChanged(get(calculatorAtom), price)
    set(calculatorAtom, updated)
  }
)

export const calculatorNexusChangedAtom = atom(
  null,
  (get, set, price: string) => {
    const updated = nexusChanged(get(calculatorAtom), price)
    set(calculatorAtom, updated)
  }
)

export const calculatorDilutedChangedAtom = atom(
  null,
  (get, set, price: string) => {
    const updated = dilutedChanged(get(calculatorAtom), price)
    set(calculatorAtom, updated)
  }
)

export const calculatorSweetstuffChangedAtom = atom(
  null,
  (get, set, price: string) => {
    const updated = sweetstuffChanged(get(calculatorAtom), price)
    set(calculatorAtom, updated)
  }
)

export const calculatorMEMarkupChangedAtom = atom(
  null,
  (get, set, markup: string) => {
    const updated = meMarkupChanged(get(calculatorAtom), markup)
    set(calculatorAtom, updated)
  }
)

export const calculatorMEValueChangedAtom = atom(
  null,
  (get, set, value: string) => {
    const updated = meValueChanged(get(calculatorAtom), value)
    set(calculatorAtom, updated)
  }
)

export const calculatorLMEMarkupChangedAtom = atom(
  null,
  (get, set, markup: string) => {
    const updated = lmeMarkupChanged(get(calculatorAtom), markup)
    set(calculatorAtom, updated)
  }
)

export const calculatorLMEValueChangedAtom = atom(
  null,
  (get, set, value: string) => {
    const updated = lmeValueChanged(get(calculatorAtom), value)
    set(calculatorAtom, updated)
  }
)

export const calculatorNBMarkupChangedAtom = atom(
  null,
  (get, set, markup: string) => {
    const updated = nbMarkupChanged(get(calculatorAtom), markup)
    set(calculatorAtom, updated)
  }
)

export const calculatorNBValueChangedAtom = atom(
  null,
  (get, set, value: string) => {
    const updated = nbValueChanged(get(calculatorAtom), value)
    set(calculatorAtom, updated)
  }
)
