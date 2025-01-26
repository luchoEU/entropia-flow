import { computeServerFormulas } from "./formulaCompute"

describe('formula compute', () => {
    test('keep base values', async () => {
        expect(computeServerFormulas({t: 1}, {})).toEqual({t: 1})
    })
})
