import { getDelta, applyDelta } from "./delta"

describe('formula parser', () => {
    test('basic', async () => {
        expect(getDelta({t: 1}, {t: 2})).toEqual({t: 2})
    })
})
