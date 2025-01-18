import { StreamRenderObject, StreamRenderValue } from "./data";

const _formulas: Record<string, (args: StreamRenderValue[]) => StreamRenderValue> = {
    IF: (args) => {
        let i = 1;
        while (i < args.length) {
            if (args[i - 1]) return args[i]
            i += 2;
        }
        return i - 1 < args.length ? args[i - 1] : ''
    }
}

interface OperatorPrecedenceData {
    k: string, // precedence key
    op: { [key: string]: (left: StreamRenderValue, right: StreamRenderValue) => StreamRenderValue }
}

const _operatorByPrecedence: OperatorPrecedenceData[] = [
    { k: 'plus', op: {
        '+': (left, right) => left + right.toString(),
    }},
    { k: 'comp', op: {
        '>': (left, right) => left > right,
        '>=': (left, right) => left >= right,
        '<': (left, right) => left < right,
        '<=': (left, right) => left <= right,
        '=': (left, right) => left === right,
        '!=': (left, right) => left !== right,
    }},
];


enum ExprType {
    unknown,
    number,
    string,
    function,
    identifier,
    symbol,
    space
}

interface Token {
    text: string
    type: ExprType
}

const formulaHelp = `Formulas start with =
Valid operators: ${_operatorByPrecedence.map(v => Object.keys(v.op)).flat().join(', ')}
Valid functions: ${Object.keys(_formulas).join(', ')}`

class FormulaParser {
    private data: StreamRenderObject;
    
    constructor(data: StreamRenderObject) {
        this.data = { ...data, true: true, false: false }; // Map of cell references to values
    }
    
    evaluate(formula: string): StreamRenderValue {
        try {
            let tokens = this._tokenize(formula);
            tokens.forEach(token => { if (token.type === ExprType.unknown) throw new Error(`ECHR: Invalid character '${token.text}'`) });
            tokens = tokens.filter(token => token.type !== ExprType.space);
            return this._parseExpression(tokens, 0);
        } catch (e) {
            return e.message
        }
    }
    
    private _tokenize(formula: string): Token[] {
        const m: {regex: RegExp, type: ExprType}[] = [
            {regex: /\d+(\.\d+)?/, type: ExprType.number},
            {regex: /[A-Z]+\(/, type: ExprType.function},
            {regex: /[a-z][A-Za-z0-9]*/, type: ExprType.identifier},
            {regex: /[(),.{}:\[\]]/, type: ExprType.symbol}, // 1 char symbols
            {regex: /[+><=!]+/, type: ExprType.symbol}, // 1 or more char symbols
            {regex: /'[^']+'/, type: ExprType.string},
            {regex: /"[^"]+"/, type: ExprType.string},
            {regex: /\s+/, type: ExprType.space},
            {regex: /./, type: ExprType.unknown},
        ]
        const regex = new RegExp(m.map(v => v.regex.source).join('|'), 'g');
        const getExprType = (token: string): ExprType =>
            m.find(v => new RegExp(`^${v.regex.source}$`).test(token))?.type || ExprType.unknown
        return formula.match(regex).map((text) => ({text, type: getExprType(text)})) || [];
    }
    
    private _parseExpression(tokens: Token[], level: number, returnParameters: boolean = false): StreamRenderValue {
        let stack: (Token | StreamRenderValue)[] = [];
        const parameters: StreamRenderValue[] = [];
        let jsonMode: { open: string, close: string, count: number, text: string } = undefined;

        while (tokens.length > 0) {
            const token = tokens.shift()!;
            if (jsonMode) {
                jsonMode.text += token.text;
                if (token.type === ExprType.symbol) {
                    if (token.text === jsonMode.close) {
                        jsonMode.count--;
                        if (jsonMode.count === 0) {
                            stack.push(JSON.parse(jsonMode.text));
                            jsonMode = undefined;
                        }
                    } else if (token.text === jsonMode.open) {
                        jsonMode.count++;
                    }
                }
            } else if (token.type === ExprType.symbol && token.text === '{') {
                jsonMode = { open: '{', close: '}', count: 1, text: '{' };
            } else if (token.type === ExprType.symbol && token.text === '[') {
                jsonMode = { open: '[', close: ']', count: 1, text: '[' };
            } else if (token.type === ExprType.function) {
                const value = this._parseExpression(tokens, level + 1, true);
                const fName = token.text.slice(0, -1); // remove trailing '('
                const f = _formulas[fName];
                if (!f) {
                    throw new Error(`EFUN: Unknown function '${token.text}'`);
                }
                stack.push(f(value as StreamRenderValue[]));
            } else if (token.type === ExprType.symbol) {
                if (token.text === '(') {
                    // Handle nested expressions recursively
                    const value = this._parseExpression(tokens, level + 1);
                    stack.push(value);
                } else if (token.text === ',') {
                    parameters.push(this._evaluateStack(stack))
                    stack = [];
                } else if (token.text === ')') {
                    if (level === 0 && tokens.length === 0) {
                        throw new Error("EPAR: Unmatched ')'");
                    }
                    // End of the current sub-expression
                    break; // while
                } else {
                    // Push symbol to evaluate later
                    stack.push(token);
                }
            } else {
                // Push to evaluate later
                stack.push(token);
            } 
        }
        
        const v = this._evaluateStack(stack);
        if (v != undefined)
            parameters.push(v);
        return returnParameters ? parameters : v;
    }
    
    private _evaluateToken(token: Token | StreamRenderValue): StreamRenderValue {
        const fMap: Record<number, (text: string) => StreamRenderValue> = {
            [ExprType.number]: t => parseFloat(t),
            [ExprType.string]: t => t.slice(1, -1), // remove quotes
            [ExprType.identifier]: t => this.data[t],
        }

        const t = token as Token
        const f = fMap[t.type];
        return f ? f(t.text) : token as StreamRenderValue;
    }

    static Pending = class {
        private _pending: Record<string, { result: StreamRenderValue, operator: string }> = { };
        eval(result: StreamRenderValue, kIn: string = undefined): StreamRenderValue {
            for (const p of _operatorByPrecedence) {
                const prev = this._pending[p.k];
                if (prev) {
                    result = p.op[prev.operator](prev.result, result);
                    delete this._pending[p.k];
                }
                if (p.k === kIn) {
                    break;
                }
            }
            return result;
        }

        precedence(operator: string): string | undefined {
            return _operatorByPrecedence.find(v => v.op[operator])?.k;
        }

        set(k: string, result: StreamRenderValue, operator: string) {
            this._pending[k] = { result, operator };
        }
    }

    private _evaluateStack(stack: (Token | StreamRenderValue)[]): StreamRenderValue {
        if (stack.length === 0) {
            return undefined;
        }

        const pending = new FormulaParser.Pending();

        let result: StreamRenderValue = this._evaluateToken(stack.shift());
        while (stack.length > 0) {
            const operator = stack.shift() as Token
            const nextValue = stack.shift();
            if (operator.text === '.') {
                const nextValueToken = nextValue as Token
                result = (result as object)[nextValueToken.text];
            } else {
                const p = pending.precedence(operator.text);
                if (!p) {
                    throw new Error(`EOPR: Unknown operator '${operator.text}'`);
                }
                result = pending.eval(result, p);
                pending.set(p, result, operator.text);
                result = this._evaluateToken(nextValue);
            }
        }
        result = pending.eval(result);

        return result;
    }
}

export default FormulaParser
export {
    formulaHelp
}
