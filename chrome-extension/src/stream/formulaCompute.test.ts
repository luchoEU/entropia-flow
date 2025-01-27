import { computeFormulas, computeServerFormulas } from "./formulaCompute"

describe('formula compute server', () => {
    test('keep base values', async () => {
        expect(computeServerFormulas({t: 1}, {})).toEqual({t: 1})
    })
})

describe('formula compute client', () => {
    test('dependencies', async () => {
        expect(computeFormulas({ t: 1, f1: '=t', f2: '=f1' }, {})).toEqual({ t: 1, f1: 1, f2: 1 })
    })
})
