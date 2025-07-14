import { computeFormulas } from "./formulaCompute"

describe('formula compute', () => {
    test('keep base values', async () => {
        expect(computeFormulas({t: 1}, {})).toEqual({t: 1})
    })
})

describe('formula compute client', () => {
    test('when there are dependencies evaluate them in order', async () => {
        expect(computeFormulas({ t: 1, f1: '=t', f2: '=f1' }, {})).toEqual({ t: 1, f1: 1, f2: 1 })
    })
})

describe('formula compute error', () => {
    test('when there are dependencies cycle', async () => {
        expect(computeFormulas({ x: '=y', y: '=x' }, {})).toEqual({
            x: "ECYC: Cycle reference 'y'",
            y: "ECYC: Cycle reference 'x'"
        });
    })
    test('when a dependency has error', async () => {
        expect(computeFormulas({ x: "='a'*1", y: '=x' }, {})).toEqual({
            x: "EOPE: '\"a\"' must be a number",
            y: "EDEP: Used variable 'x' has errors"
        });
    })
})
