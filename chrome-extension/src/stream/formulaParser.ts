import { getNowDate, TemporalValue } from "../common/state";
import { StreamRenderObject, StreamRenderValue } from "./data";

type CheckFunction = (v: StreamRenderValue) => string | undefined;
const _typeCheck = (type: string): CheckFunction => v => typeof v !== type ? type : undefined;
const _numberCheck = _typeCheck('number');
const _arrayCheck = (elementCheck?: CheckFunction): CheckFunction => v => {
    if (!Array.isArray(v))
        return 'list';

    if (!elementCheck)
        return;

    for (const i of v) {
        const result = elementCheck(i);
        if (result)
            return `list of ${result}`;
    }
}

function _positionString(n: number): string {
    switch (n) {
        case 0: return 'first';
        case 1: return 'second';
        case 2: return 'third';
        default: return `${n}th`;
    }
}

function _parametersCheck(name: string, args: StreamRenderValue[], check: CheckFunction[]) {
    if (args.length !== check.length)
        throw new Error(`EARG: ${name} must have ${check.length} argument${check.length === 1 ? '' : 's'}`);

    for (let i = 0; i < check.length; i++) {
        const result = check[i](args[i])
        if (result) {
            const pos = check.length === 1 ? '' : `${_positionString(i)} `;
            throw new Error(`EARG: ${name} invalid ${pos}argument, it must be a ${result}`);
        }
    }
}

const _clientFormulas: Record<string, (args: StreamRenderValue[]) => StreamRenderValue> = {
    IF: (args) => {
        let i = 1;
        while (i < args.length) {
            if (args[i - 1]) return args[i]
            i += 2;
        }
        return i - 1 < args.length ? args[i - 1] : ''
    },
    SUM: (args) => {
        _parametersCheck('SUM', args, [_arrayCheck(_numberCheck)])
        return (args[0] as number[]).reduce((a, b) => a + b, 0);
    },
    AVERAGE: (args) => {
        _parametersCheck('AVERAGE', args, [_arrayCheck(_numberCheck)])
        const list = args[0] as number[]
        return list.reduce((a, b) => a + b, 0) / list.length;
    },
    COUNT: (args) => {
        _parametersCheck('COUNT', args, [_arrayCheck()])
        return (args[0] as StreamRenderValue[]).length;
    },
    ROUND: (args) => {
        _parametersCheck('ROUND', args, [_numberCheck, _numberCheck])
        const p = Math.pow(10, (args[1] as number));
        return Math.round((args[0] as number) / p) * p;
    },
    DECIMALS: (args) => {
        _parametersCheck('DECIMALS', args, [_numberCheck, _numberCheck])
        if ((args[1] as number) < 0) throw new Error('EARG: DECIMALS second argument must be >= 0');
        return (args[0] as number).toFixed(args[1] as number);
    }
}

const _serverFormulas: Record<string, (args: FormulaValue[]) => FormulaValue> = {
    LAST: (args) => {
        if (args.length !== 2)
            return { v: 'EARG: LAST must have 2 arguments' };

        const temporalValue = args[0].t as TemporalValue
        if (!temporalValue)
            return { v: "EARG: LAST invalid first argument, it must be a temporal variable" };

        let seconds = args[1].v
        if (typeof seconds !== 'number')
            return { v: "EARG: LAST invalid second argument, it must be a number" };

        let last: number = 0
        let from = getNowDate() - 1000
        const list = [ ]
        for (const v of temporalValue.history) {
            while (v.time <= from && seconds > 0) {
                list.push(last);
                last = 0;
                from -= 1000;
                seconds--;
            }
            if (seconds === 0) break;
            last += v.value;
        }
        if (seconds > 0) {
            list.push(last);
        }
        while (seconds > 1) {
            list.push(0);
            seconds--;
        }
        return { v: list }
    }
}

type OperatorFunction = (left: StreamRenderValue, right: StreamRenderValue) => StreamRenderValue
interface OperatorPrecedenceData {
    k: string, // precedence key
    op: { [key: string]: OperatorFunction }
}
const _operatorByPrecedence: OperatorPrecedenceData[] = [
    { k: 'mult', op: {
        '*': (left, right) => typeof left === 'number' && typeof right === 'number' ? left * right : `${left}*${right}`,
        '/': (left, right) => typeof left === 'number' && typeof right === 'number' ? left / right : `${left}/${right}`
    }},
    { k: 'plus', op: {
        '+': (left, right) => typeof left === 'number' && typeof right === 'number' ? left + right : left + right.toString(),
        '-': (left, right) => typeof left === 'number' && typeof right === 'number' ? left - right : `${left}-${right}`
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
const _binaryOperatorFunction: Record<string, OperatorFunction> = Object.fromEntries(_operatorByPrecedence.map(v => Object.entries(v.op)).flat())
const _unaryOperatorFunction: Record<string, (value: StreamRenderValue) => StreamRenderValue> = {
    '-': (value) => typeof value === 'number' ? -value : `-${value}`,
}

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
Valid functions: ${[ ...Object.keys(_clientFormulas), ...Object.keys(_serverFormulas) ].join(', ')}`

type FormulaValue = { v: StreamRenderValue, t?: Record<string, TemporalValue> | TemporalValue }

interface IFormula { // internal formula
    evaluate: (data: FormulaValue) => FormulaValue
    text: string,
    usedVariables: Set<string>,
    isServer: boolean
}

class Formula {
    private formula: IFormula
    constructor(formula: IFormula) {
        this.formula = formula
        this.text = formula.text
        this.usedVariables = formula.usedVariables
        this.isServer = formula.isServer
    }

    evaluate(data: StreamRenderObject, temporalData?: Record<string, TemporalValue>): StreamRenderValue {
        try {
            return this.formula.evaluate({ v: data, t: temporalData }).v
        } catch (e) {
            return e.message
        }
    }

    text: string
    usedVariables: Set<string>
    isServer: boolean // the formula needs to be evaluated in the server
}

function parseFormula(formula: string): Formula {
    return FormulaParser.parse(formula)
}

const _constantFormula = (value: StreamRenderValue): IFormula => ({
    evaluate: () => ({ v: value }),
    text: JSON.stringify(value),
    isServer: false,
    usedVariables: new Set(),
})

const _errorFormula = (text: string): IFormula => ({
    ..._constantFormula(text),
    evaluate: () => { throw new Error(text) }
})

const _baseFormula = (name: string, args: IFormula[]) => ({
    text: `${name}(${args.map(v => v.text).join(', ')})`,
    usedVariables: new Set(args.flatMap(v => Array.from(v.usedVariables)))
})

interface IFunctionFormula extends IFormula {
    function: (target: IFormula) => IFunctionFormula
}

const _clientFunctionFormula = (name: string, args: IFormula[]): IFunctionFormula => ({
    ..._baseFormula(name, args),
    evaluate: (d) => ({ v: _clientFormulas[name](args.map(v => v.evaluate(d).v)) }),
    isServer: args.some(v => v.isServer),
    function: (target: IFormula) => _clientFunctionFormula(name, [target, ...args])
})

const _serverFunctionFormula = (name: string, args: IFormula[]): IFunctionFormula => ({
    ..._baseFormula(name, args),
    evaluate: (d) => _serverFormulas[name](args.map(v => v.evaluate(d))),
    isServer: true,
    function: (target: IFormula) => _serverFunctionFormula(name, [target, ...args])
})

const _unaryOperatorFormula = (op: string, formula: IFormula): IFormula => ({
    evaluate: (d) => ({ v: _unaryOperatorFunction[op](formula.evaluate(d).v) }),
    text: `${op}${formula.text}`,
    isServer: formula.isServer,
    usedVariables: formula.usedVariables
})

const _binaryOperatorFormula = (op: string, left: IFormula, right: IFormula): IFormula => ({
    evaluate: (d) => ({ v: _binaryOperatorFunction[op](left.evaluate(d).v, right.evaluate(d).v) }),
    text: `${left.text} ${op} ${right.text}`,
    isServer: left.isServer || right.isServer,
    usedVariables: new Set([...left.usedVariables, ...right.usedVariables])
})

const _propertyFormula = (f: IFormula, name: string): IFormula => ({
    evaluate: (d) => { const x = f.evaluate(d).v; return typeof x === 'object' && name in x ? { v: x[name] } : { v: `EPROP: Property '${name}' not found` } },
    text: `${f.text}.${name}`,
    isServer: f.isServer,
    usedVariables: f.usedVariables
})

const _variableFormula = (name: string): IFormula => ({
    evaluate: (d) => ({ v: typeof d.v === 'object' && name in d.v ? d.v[name] : `EVAR: Variable '${name}' not found`, t: d.t?.[name] }),
    text: name,
    isServer: false,
    usedVariables: new Set([name])
})

class FormulaParser {
    static parse(formula: string): Formula {
        return new Formula(this._parse(formula))
    }

    private static _parse(formula: string): IFormula {
        try {
            let tokens = FormulaParser._tokenize(formula);
            tokens.forEach(token => { if (token.type === ExprType.unknown) throw new Error(`ECHR: Invalid character '${token.text}'`) });
            tokens = tokens.filter(token => token.type !== ExprType.space);

            if (tokens.length === 0)
                return _errorFormula(`EMTY: Formula '${formula}' is empty`)
            if (tokens[0].type === ExprType.symbol && tokens[0].text === '=')
                return _errorFormula(`EOPS: Invalid first character '${tokens[0].text}'`)
            return this._parseExpression(tokens, 0);
        } catch (e) {
            return _errorFormula(e.message)
        }
    }
    
    private static _tokenize(formula: string): Token[] {
        const m: {regex: RegExp, type: ExprType}[] = [
            {regex: /\d+(\.\d+)?/, type: ExprType.number},
            {regex: /[A-Za-z]+\(/, type: ExprType.function},
            {regex: /[A-Za-z][A-Za-z0-9]*/, type: ExprType.identifier},
            {regex: /[-+/*(),.{}:\[\]]/, type: ExprType.symbol}, // 1 char symbols
            {regex: /[><=!]+/, type: ExprType.symbol}, // 1 or more char symbols
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
    
    private static _parseExpression(tokens: Token[], level: number): IFormula {
        return this._parseNesting(tokens, level, false) as IFormula;
    }

    private static _parseParameters(tokens: Token[], level: number): IFormula[] {
        return this._parseNesting(tokens, level, true) as IFormula[];
    }

    private static _parseNesting(tokens: Token[], level: number, returnParameters: boolean): IFormula | IFormula[] {
        let stack: (Token | IFormula)[] = [];
        const parameters: IFormula[] = [];
        let jsonMode: { open: string, close: string, count: number, text: string } = undefined;
        let endsWithParenthesis = false

        while (tokens.length > 0) {
            const token = tokens.shift()!;
            if (jsonMode) {
                jsonMode.text += token.text;
                if (token.type === ExprType.symbol) {
                    if (token.text === jsonMode.close) {
                        jsonMode.count--;
                        if (jsonMode.count === 0) {
                            stack.push(_constantFormula(JSON.parse(jsonMode.text)));
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
                const value = this._parseParameters(tokens, level + 1);
                const fName = token.text.slice(0, -1).toUpperCase(); // remove trailing '('
                if (_clientFormulas[fName]) {
                    stack.push(_clientFunctionFormula(fName, value));
                } else if (_serverFormulas[fName]) {
                    stack.push(_serverFunctionFormula(fName, value));
                } else {
                    throw new Error(`EFUN: Unknown function '${fName}'`);
                }
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
                    endsWithParenthesis = true;
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
        if (!endsWithParenthesis && level > 0 && tokens.length === 0) {
            throw new Error("EPAR: Unmatched '('");
        }

        const v = this._evaluateStack(stack);
        if (v != undefined)
            parameters.push(v);
        return returnParameters ? parameters : v;
    }

    private static _evaluateToken(token: Token | IFormula): IFormula {
        const fMap: Record<number, (text: string) => IFormula> = {
            [ExprType.number]: t => _constantFormula(parseFloat(t)),
            [ExprType.string]: t => _constantFormula(t.slice(1, -1)), // remove quotes
            [ExprType.identifier]: t =>
                t === 'false' ? _constantFormula(false) : (t === 'true' ? _constantFormula(true) : _variableFormula(t)),
        }

        const t = token as Token
        const f = fMap[t.type];
        return f ? f(t.text) : token as IFormula;
    }

    static Pending = class {
        private _pending: Record<string, { result: IFormula, operator: string }> = { };
        eval(result: IFormula, kIn: string = undefined): IFormula {
            for (const p of _operatorByPrecedence) {
                const prev = this._pending[p.k];
                if (prev) {
                    result = _binaryOperatorFormula(prev.operator, prev.result, result);
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

        set(k: string, result: IFormula, operator: string) {
            this._pending[k] = { result, operator };
        }
    }

    private static _evaluateStack(stack: (Token | IFormula)[]): IFormula {
        if (stack.length === 0) {
            return undefined;
        }

        const pending = new FormulaParser.Pending();

        let first = stack.shift() as Token
        if (first.type === ExprType.symbol && _unaryOperatorFunction[first.text]) {
            return _unaryOperatorFormula(first.text, this._evaluateStack(stack));
        }

        let result: IFormula = this._evaluateToken(first);
        while (stack.length > 0) {
            const operator = stack.shift() as Token
            const nextValue = stack.shift();
            if (operator.text === '.') {
                if ('function' in nextValue) {
                    result = (nextValue as IFunctionFormula).function(result);
                } else {
                    const nextValueToken = nextValue as Token
                    result = _propertyFormula(result, nextValueToken.text);
                }
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

export {
    parseFormula,
    Formula,
    formulaHelp
}
