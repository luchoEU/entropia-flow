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
    test('new property', async () => {
        expect(getDelta({t: {}}, {t: {x: 1}})).toEqual({t: {x: 1}})
    })
    test('delete', async () => {
        expect(applyDelta({t: 1}, getDelta({t: 2}, { }))).toEqual({ })
    })
    test('action', async () => {
        const action = () => {};
        expect(applyDelta({action}, { })).toEqual({action})
    })
    test('no delta in list', async () => {
        expect(getDelta({t: [3]}, {t: [1,2]})).toEqual({t: [1,2]})
    })
    test('apply delta in list', async () => {
        expect(applyDelta({t: [1,3]}, getDelta({t: [3]}, {t: [1,2]}))).toEqual({t: [1,2]})
    })
})
