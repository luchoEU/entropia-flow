import { setMockDate } from "../common/state"
import { parseFormula } from "./formulaParser"

describe('formula parser', () => {
    test('basic', async () => {
        expect(parseFormula('test')
            .evaluate({test: 1}))
            .toEqual(1)
    })
    test('if', async () => {
        expect(parseFormula("IF(delta>0,'green',delta<0,'red','black')")
            .evaluate({delta: '0.00'}))
            .toEqual('black')
    })
    test('dot', async () => {
        expect(parseFormula("IF(backDark, img.logoWhite, img.logoBlack)")
            .evaluate({backDark: true, img: {logoWhite: 'white', logoBlack: 'black'}}))
            .toEqual('white')
    })
    test('negative', async () => {
        expect(parseFormula("-2")
            .evaluate({}))
            .toEqual(-2)
    })
    test('round', async () => {
        expect(parseFormula("ROUND(2.45, -1)")
            .evaluate({}))
            .toEqual(2.5)
    })
    test('last', async () => {
        setMockDate(new Date('2025-01-16 07:21:41').getTime())
        expect(parseFormula("LAST(vehicleDamage, 3)")
            .evaluate({}, { vehicleDamage: { history: [
                    { time: new Date('2025-01-16 07:21:41').getTime(), value: 134.0 },
                    { time: new Date('2025-01-16 07:21:39').getTime(), value: 12.5 }
                ], total: undefined, count: undefined }}))
            .toEqual([134, 0, 12.5])
    })
    test('object like syntax', async () => {
        expect(parseFormula("[3,2,1].AVERAGE()")
            .evaluate({}))
            .toEqual(2)
    })
    test('case insensitive', async () => {
        expect(parseFormula("sUM([1,3])")
            .evaluate({}))
            .toEqual(4)
    })
})

describe('formula errors', () => {
    test('error invalid character', async () => {
        expect(parseFormula("IF(t; 1; 2)")
            .evaluate({}))
            .toEqual("ECHR: Invalid character ';'")
    })
    test('error extra parenthesis', async () => {
        expect(parseFormula("SUM([1]")
            .evaluate({}))
            .toEqual("EPAR: Unmatched '('")
    })
    test('error missing parenthesis', async () => {
        expect(parseFormula("IF(delta > 0, 'Profit', delta < 0, 'Loss'))")
            .evaluate({}))
            .toEqual("EPAR: Unmatched ')'")
    })
    test('error start with =', async () => {
        expect(parseFormula("=5")
            .evaluate({}))
            .toEqual("EOPS: Invalid first character '='")
    })
    test('error invalid variable', async () => {
        expect(parseFormula("test")
            .evaluate({}))
            .toEqual("EVAR: Variable 'test' not found")
    })
    test('error invalid property', async () => {
        expect(parseFormula("test.prop")
            .evaluate({}))
            .toEqual("EPROP: Property 'prop' not found")
    })
    test('error check parameter number', async () => {
        expect(parseFormula("ROUND(1)")
            .evaluate({}))
            .toEqual("EARG: ROUND must have 2 arguments")
    })
    test('error check parameter type', async () => {
        expect(parseFormula("ROUND('a', 1)")
            .evaluate({}))
            .toEqual("EARG: ROUND invalid first argument, it must be a number")
    })
})
