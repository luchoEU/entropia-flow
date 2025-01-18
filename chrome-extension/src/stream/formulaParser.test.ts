import FormulaParser from "./formulaParser"

describe('formula parser', () => {
    test('basic', async () => {
        const parser = new FormulaParser({test: 1})
        expect(parser.evaluate('test')).toEqual(1)
    })
    test('if', async () => {
        const parser = new FormulaParser({delta: '0.00'})
        expect(parser.evaluate("IF(delta>0,'green',delta<0,'red','black')")).toEqual('black')
    })
    test('dot', async () => {
        const parser = new FormulaParser({backDark: true, img: {logoWhite: 'white', logoBlack: 'black'}})
        expect(parser.evaluate("IF(backDark, img.logoWhite, img.logoBlack)")).toEqual('white')
    })
    test('error invalid character', async () => {
        const parser = new FormulaParser({t: true})
        expect(parser.evaluate("IF(t; 1; 2)")).toEqual("ECHR: Invalid character ';'")
    })
    test('error extra parenthesis', async () => {
        const parser = new FormulaParser({})
        expect(parser.evaluate("IF(delta > 0, 'Profit', delta < 0, 'Loss'))")).toEqual("EPAR: Unmatched ')'")
    })
})
