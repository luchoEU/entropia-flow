import { getDelta, applyDelta } from "./delta"

describe('formula parser', () => {
    test('basic', async () => {
        expect(getDelta({t: 1}, {t: 2})).toEqual({t: 2})
    })
    test('equal simple', async () => {
        expect(getDelta({t: 2}, {t: 2})).toEqual(undefined)
    })
    test('equal with objects', async () => {
        expect(getDelta({t: {x: 1}}, {t: {x: 1}})).toEqual(undefined)
    })
})
