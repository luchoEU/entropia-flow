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
            .evaluate({delta: 0}))
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
                ], total: undefined!, count: undefined! }}))
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
    test('select', async () => {
        expect(parseFormula("a.map(c)")
            .evaluate({ a: [{ b: 1, c: 2 }, { b: 3, c: 4 }] }))
            .toEqual([2, 4])
    })
    test('coerse', async () => {
        expect(parseFormula("3*t")
            .evaluate({t:'2.5'}))
            .toEqual(7.5)
    })
    test('concat', async () => {
        expect(parseFormula("3+t")
            .evaluate({t:'2.5'}))
            .toEqual('32.5')
    })
    test('number', async () => {
        expect(parseFormula('number("2.5")')
            .evaluate({}))
            .toEqual(2.5)
    })
})

describe('formula print', () => {
    test('help', async () => {
        expect(parseFormula('(a - b).sum()').text).toEqual('(a - b).SUM()')
    })
})

describe('formula used variables', () => {
    test('high order', async () => {
        expect(parseFormula('loot.select(value).sum()').usedVariables.has('value')).toBe(false)
    })
})

describe('formula errors', () => {
    test('error invalid character', async () => {
        expect(() => parseFormula("IF(t; 1; 2)")
            .evaluate({}))
            .toThrow("ECHR: Invalid character ';'")
    })
    test('error extra parenthesis', async () => {
        expect(() => parseFormula("SUM([1]")
            .evaluate({}))
            .toThrow("EPAR: Unmatched '('")
    })
    test('error missing parenthesis', async () => {
        expect(() => parseFormula("IF(delta > 0, 'Profit', delta < 0, 'Loss'))")
            .evaluate({}))
            .toThrow("EPAR: Unmatched ')'")
    })
    test('error start with =', async () => {
        expect(() => parseFormula("=5")
            .evaluate({}))
            .toThrow("EOPS: Invalid first character '='")
    })
    test('when a variable is not found', async () => {
        expect(() => parseFormula("test")
            .evaluate({}))
            .toThrow("EVAR: Variable 'test' not found")
    })
    test('when a property is not found', async () => {
        expect(() => parseFormula("test.prop")
            .evaluate({ test: { } }))
            .toThrow("EPROP: Property 'prop' not found")
    })
    test('when the it has the incorrect number of parameters', async () => {
        expect(() => parseFormula("ROUND(1)")
            .evaluate({}))
            .toThrow("EARG: ROUND must have 2 arguments")
    })
    test('when a parameter is not the correct type', async () => {
        expect(() => parseFormula("ROUND('a', 1)")
            .evaluate({}))
            .toThrow("EARG: ROUND invalid first argument, it must be a number")
    })
    test('when the operator in not a number', async () => {
        expect(() => parseFormula("x*y")
            .evaluate({ x: 1, y: 'a' }))
            .toThrow("EOPE: 'y' must be a number")
    })
    test('when there are multiple errors show only the first', async () => {
        expect(() => parseFormula("x.p + y.p")
            .evaluate({ x: 1, y: 2 }))
            .toThrow("EPROP: Property 'p' not found")
    })
})
