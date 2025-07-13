import { getNowDate, TemporalValue } from "../common/state";
import { StreamRenderObject, StreamRenderValue } from "./data";
import Interpreter from 'js-interpreter';
import * as Babel from '@babel/standalone';

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
        const [list] = _parametersCheck('SUM', args, [_arrayCheck(_numberCheck)]) as [number[]]
        return list.reduce((a, b) => a + b, 0);
    },
    AVERAGE: (args) => {
        const [list] = _parametersCheck('AVERAGE', args, [_arrayCheck(_numberCheck)]) as [number[]]
        return list.reduce((a, b) => a + b, 0) / list.length;
    },
    COUNT: (args) => {
        const [list] = _parametersCheck('COUNT', args, [_arrayCheck()]) as [any[]]
        return list.length;
    },
    ROUND: (args) => {
        const [number, decimals] = _parametersCheck('ROUND', args, [_numberCheck, _numberCheck]) as [number, number]
        const p = Math.pow(10, decimals);
        return Math.round(number / p) * p;
    },
    DECIMALS: (args) => {
        const [number, decimals] = _parametersCheck('DECIMALS', args, [_numberCheck, _positiveNumberCheck]) as [number, number]
        return number.toFixed(decimals);
    },
    NUMBER: (args) => {
        const [string] = _parametersCheck('NUMBER', args, [_stringCheck]) as [string]
        return Number.parseFloat(string);
    },
    OR: (args) => {
        const list = _parametersCheck('OR', args, args.map(_ => _booleanCheck)) as boolean[]
        return list.some(v => v);
    },
    AND: (args) => {
        const list = _parametersCheck('AND', args, args.map(_ => _booleanCheck)) as boolean[]
        return list.every(v => v);
    },
    NOT: (args) => {
        const [value] = _parametersCheck('NOT', args, [_booleanCheck]) as [boolean]
        return !value;
    }
}

const _clientHighOrderFormulas: Record<string, { p: number[], f: (data: FormulaValue, args: IFormula[]) => FormulaValue }> = {
    MAP: {
        p: [1], // high order parameters
        f: (data, args) => {
            _parameterCountCheck('MAP', args, 2);
            const list =_parameterSingleCheck('MAP', args[0].evaluate(data).v, 0, _arrayCheck()) as any[];
            return { v: list.map(x => args[1].evaluate({v: x}).v) };
        }
    }
}

const _serverFormulas: Record<string, (args: FormulaValue[]) => FormulaValue> = {
    LAST: (args) => {
        const [{t:temporalValue}, {v:argSeconds}] = _parametersCheck('LAST', args, [_temporalCheck, _valueCheck(_numberCheck)]) as [{t:TemporalValue}, {v:number}]

        let seconds = argSeconds
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
    },
    AFTER: (args) => {
        const [{t:temporalValue}, {v:argTime}] = _parametersCheck('AFTER', args, [_temporalCheck, _valueCheck(_numberCheck)]) as [{t:TemporalValue}, {v:number}]
        return { v: temporalValue.history.filter(v => v.time >= argTime).map(v => v.value) }
    },
    BEFORE: (args) => {
        const [{t:temporalValue}, {v:argTime}] = _parametersCheck('BEFORE', args, [_temporalCheck, _valueCheck(_numberCheck)]) as [{t:TemporalValue}, {v:number}]
        return { v: temporalValue.history.filter(v => v.time < argTime).map(v => v.value) }
    }
}

type CheckFunction<T> = (v: T) => string | undefined;
const _typeCheck = (type: string): CheckFunction<StreamRenderValue> => v => typeof v !== type ? `a ${type}` : undefined;
const _numberCheck = _typeCheck('number');
const _stringCheck = _typeCheck('string');
const _positiveNumberCheck = (v: StreamRenderValue) => typeof v !== 'number' ? 'a number' : (v < 0 ? '>= 0' : undefined);
const _booleanCheck = (v: StreamRenderValue) => typeof v !== 'boolean' ? 'a boolean' : undefined;
const _arrayCheck = (elementCheck?: CheckFunction<StreamRenderValue>): CheckFunction<StreamRenderValue> => v => {
    if (!Array.isArray(v))
        return 'a list';

    if (!elementCheck)
        return;

    for (const i of v) {
        const result = elementCheck(i);
        if (result)
            return `a list of ${result.slice(2)}s`;
    }
}
const _valueCheck = (check: CheckFunction<StreamRenderValue>) => (v: FormulaValue) => check(v.v)
const _temporalCheck = (v: FormulaValue) => v.t ? undefined : 'a temporal variable';

function _positionString(n: number): string {
    switch (n) {
        case 0: return 'first';
        case 1: return 'second';
        case 2: return 'third';
        default: return `${n}th`;
    }
}

function _parameterCountCheck(name: string, args: any[], count: number) {
    if (args.length !== count)
        throw new Error(`EARG: ${name} must have ${count} argument${count === 1 ? '' : 's'}`);
}

function _parameterSingleCheck(name: string, arg: any, index: number, check: CheckFunction<any>, addPosition: boolean = true): any {
    const result = check(arg)
    if (result) {
        const pos = addPosition ? `${_positionString(index)} ` : '';
        throw new Error(`EARG: ${name} invalid ${pos}argument, it must be ${result}`);
    }
    return arg
}

function _parametersCheck<T>(name: string, args: T[], check: CheckFunction<T>[]): any[] {
    _parameterCountCheck(name, args, check.length);
    return args.map((v, i) => _parameterSingleCheck(name, v, i, check[i], check.length > 1));
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
    javascript,
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
Valid functions: ${[ ...Object.keys(_clientFormulas), ...Object.keys(_clientHighOrderFormulas) ].join(', ')}
Valid functions for temporal variables: ${Object.keys(_serverFormulas).join(', ')}
You can also use Javascript expressions inside backticks (e.g. \`a + b\`).`

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
        return this.formula.evaluate({ v: data, t: temporalData }).v
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

const cycleErrorFormula = (variables: string[]) =>
    _errorFormula(`ECYC: Cycle reference${variables.length !== 1 ? 's' : ''} ${variables.map(s => `'${s}'`).join(', ')}`)

// Helper for dependency tracking. This is a "good enough" heuristic for cycle detection.
const JS_KEYWORDS = new Set(['break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'export', 'extends', 'false', 'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'new', 'null', 'return', 'super', 'switch', 'this', 'throw', 'true', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield', 'enum', 'implements', 'interface', 'let', 'package', 'private', 'protected', 'public', 'static', 'await', 'undefined', 'map', 'filter', 'reduce', 'forEach', 'find', 'some', 'every']);

function _extractIdentifiers(code: string): Set<string> {
    const identifierRegex = /[a-zA-Z_$][a-zA-Z0-9_$]*/g;
    const matches = new Set(code.match(identifierRegex) || []);
    const used = new Set<string>();
    for (const match of matches) {
        if (!JS_KEYWORDS.has(match)) {
            used.add(match);
        }
    }
    return used;
}

/**
 * Creates a formula from a full Javascript expression string (e.g. `myList.filter(...)`).
 * This implementation uses the 'JS-Interpreter' library to safely execute the code
 * in a sandboxed environment, making it compliant with strict Content Security Policies (CSP).
 */
const _javascriptFormula = (jsCodeWithBackticks: string): IFormula => {
    const jsCode = jsCodeWithBackticks.slice(1, -1);
    const usedVariables = _extractIdentifiers(jsCode);

    // Transpile the modern JS code to ES5 at parse time
    let es5Code;
    try {
        es5Code = Babel.transform(jsCode, { presets: ['env'] }).code;
    } catch (e) {
        // If Babel fails to parse, it's a syntax error in the user's code.
        return _errorFormula(`ESYN: Syntax error in JS expression: ${e.message}`);
    }

    return {
        // Evaluate is now SYNCHRONOUS again, so you can undo the 'async' refactoring.
        // This will simplify your whole codebase significantly.
        evaluate: (d) => {
            if (typeof d.v !== 'object' || d.v === null) {
                throw new Error(`EJSC: Javascript expressions require an object context, but got ${typeof d.v}`);
            }
            const context = d.v as object;

            try {
                // The init function to set up the interpreter's global scope.
                const initFunction = (interpreter: any, globalObject: any) => {
                    for (const key in context) {
                        if (Object.prototype.hasOwnProperty.call(context, key)) {
                            const value = interpreter.nativeToPseudo(context[key]);
                            interpreter.setProperty(globalObject, key, value);
                        }
                    }
                };
                
                // Use the transpiled ES5 code
                const interpreter = new Interpreter(es5Code, initFunction);
                interpreter.run();

                const result = interpreter.pseudoToNative(interpreter.value);
                return { v: result };

            } catch (e) {
                throw new Error(`EJSR: Error in JS expression '${jsCode}': ${e.message}`);
            }
        },
        text: jsCodeWithBackticks,
        isServer: false,
        usedVariables: usedVariables,
    };
};

const _baseFormula = (name: string, args: IFormula[], hasTarget?: boolean) => {
    const parameters = hasTarget ? args.slice(1) : args
    const targetText = hasTarget ? `(${args[0].text}).` : ''
    return {
        text: `${targetText}${name}(${parameters.map(v => v.text).join(', ')})`,
        usedVariables: new Set(args.flatMap(v => Array.from(v.usedVariables)))
    }
}

type FunctionFormulaFactory = (name: string, args: IFormula[], hasTarget?: boolean) => IFunctionFormula

interface IFunctionFormula extends IFormula {
    function: (target: IFormula) => IFunctionFormula
}

const _clientFunctionFormula: FunctionFormulaFactory = (name, args, hasTarget) => ({
    ..._baseFormula(name, args, hasTarget),
    evaluate: (d) => ({ v: _clientFormulas[name](args.map(v => v.evaluate(d).v)) }),
    isServer: args.some(v => v.isServer),
    function: (target: IFormula) => _clientFunctionFormula(name, [target, ...args], true)
})

const _clientHighOrderFunctionFormula: FunctionFormulaFactory = (name, args, hasTarget) => {
    const definition = _clientHighOrderFormulas[name]
    return {
        ..._baseFormula(name, args, hasTarget),
        evaluate: (d) => definition.f(d, args),
        isServer: args.some(v => v.isServer),
        usedVariables: new Set(args.filter((_,i) => !definition.p.includes(i)).flatMap(v => Array.from(v.usedVariables))),
        function: (target: IFormula) => _clientHighOrderFunctionFormula(name, [target, ...args], true)
    }
}

const _serverFunctionFormula: FunctionFormulaFactory = (name, args, hasTarget) => ({
    ..._baseFormula(name, args, hasTarget),
    evaluate: (d) => _serverFormulas[name](args.map(v => v.evaluate(d))),
    isServer: true,
    function: (target: IFormula) => _serverFunctionFormula(name, [target, ...args], true)
})

function _evaluateOperand(op: string, d: FormulaValue, formula: IFormula): string | number {
    const result = formula.evaluate(d).v
    
    if (typeof result === 'string') {
        if (op === '+')
            return result

        const n = parseFloat(result)
        if (!Number.isNaN(n))
            return n;
    }
    
    if (typeof result !== 'number')
        throw new Error(`EOPE: '${formula.text}' must be a number`)

    return result
}

const _unaryOperatorFormula = (op: string, formula: IFormula): IFormula => ({
    evaluate: (d) => ({ v: _unaryOperatorFunction[op](_evaluateOperand(op, d, formula)) }),
    text: `${op}${formula.text}`,
    isServer: formula.isServer,
    usedVariables: formula.usedVariables
})

const _binaryOperatorFormula = (op: string, left: IFormula, right: IFormula): IFormula => ({
    evaluate: (d) => ({ v: _binaryOperatorFunction[op](_evaluateOperand(op, d, left), _evaluateOperand(op, d, right)) }),
    text: `${left.text} ${op} ${right.text}`,
    isServer: left.isServer || right.isServer,
    usedVariables: new Set([...left.usedVariables, ...right.usedVariables])
})

const _propertyFormula = (f: IFormula, name: string): IFormula => ({
    evaluate: (d) => {
        const target = f.evaluate(d).v;
        if (typeof target === 'object' && name in target)
            return { v: target[name] }
        else
            throw new Error(`EPROP: Property '${name}' not found`)
    },
    text: `${f.text}.${name}`,
    isServer: f.isServer,
    usedVariables: f.usedVariables
})

const _variableFormula = (name: string): IFormula => ({
    evaluate: (d) => {
        if (typeof d.v === 'object' && name in d.v)
            return { v: d.v[name], t: d.t?.[name] }
        else if (typeof d.t === 'object' && name in d.t)
            return { v: undefined, t: d.t[name] }
        else
            throw new Error( `EVAR: Variable '${name}' not found`)        
    },
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
            {regex: /`[^`]*`/, type: ExprType.javascript},
            {regex: /'[^']*'/, type: ExprType.string},
            {regex: /"[^"]*"/, type: ExprType.string},
            {regex: /\s+/, type: ExprType.space},
            {regex: /./, type: ExprType.unknown},
        ]
        const regex = new RegExp(m.map(v => v.regex.source).join('|'), 'g');
        const getExprType = (token: string): ExprType =>
            m.find(v => new RegExp(`^${v.regex.source}$`).test(token))?.type || ExprType.unknown
        return formula.match(regex)?.map((text) => ({text, type: getExprType(text)})) || [];
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
                } else if (_clientHighOrderFormulas[fName]) {
                    stack.push(_clientHighOrderFunctionFormula(fName, value));
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
            [ExprType.string]: t => _constantFormula(t.slice(1, -1)),
            [ExprType.javascript]: t => _javascriptFormula(t),
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
    cycleErrorFormula,
    Formula,
    formulaHelp
}
