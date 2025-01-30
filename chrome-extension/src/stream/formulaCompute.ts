import { TemporalValue } from "../common/state";
import { StreamRenderObject } from "./data";
import { cycleErrorFormula, Formula, parseFormula } from "./formulaParser";

function _parseFormulas(obj: StreamRenderObject): [string, Formula][] {
    let formulas = Object.entries(obj)
        .filter(([, value]) => typeof value === 'string' && value.startsWith('='))
        .map(([key, value]: [string, string]): [string, Formula] => [key, parseFormula(value.slice(1))]);

    const sortedFromulas = [];
    while (formulas.length) {
        const usedVariables = formulas.reduce((s, [, formula]) => s.size === 0 ? formula.usedVariables : new Set([...s, ...formula.usedVariables]), new Set());
        const notUsedFormulas = formulas.filter(([key]) => !usedVariables.has(key));
        if (notUsedFormulas.length === 0) {
            // circular references
            const keys = new Set(formulas.map(([key,]) => key));
            sortedFromulas.unshift(...formulas.map(([key, formula]) =>
                [key, cycleErrorFormula(Array.from(formula.usedVariables).filter(s => keys.has(s)))]));
            break
        } else {
            sortedFromulas.unshift(...notUsedFormulas);
            formulas = formulas.filter(([key]) => usedVariables.has(key));
        }
    }
    return sortedFromulas;
}

function _computeFormulas(formulas: [string, Formula][], obj: StreamRenderObject, temporalData: Record<string, TemporalValue>): StreamRenderObject {
    const formulaWithError = []
    return formulas.reduce((v, [key, formula]) => {
        const usedVariableWithError = formulaWithError.filter(k => formula.usedVariables.has(k)).map(k => `'${k}'`);
        if (usedVariableWithError.length) {
            formulaWithError.push(key);
            if (usedVariableWithError.length === 1) {
                v[key] = `EDEP: Used variable ${usedVariableWithError[0]} has errors`
            } else {
                v[key] = `EDEP: Used variables ${usedVariableWithError.join(', ')} have errors`
            }
        } else {
            try {
                v[key] = formula.evaluate(v, temporalData);
            } catch (e) {
                formulaWithError.push(key);
                v[key] = e.message;
            }
        }
        return v
    }, { ...obj }) as StreamRenderObject;
}

function computeFormulas(obj: StreamRenderObject, temporalVariables?: Record<string, TemporalValue>): StreamRenderObject {
    return _computeFormulas(_parseFormulas(obj), obj, temporalVariables);
}

function computeServerFormulas(obj: StreamRenderObject, temporalVariables: Record<string, TemporalValue>): StreamRenderObject {
    const formulas = _parseFormulas(obj)
    const computed = _computeFormulas(formulas, obj, temporalVariables);
    const isServer = Object.fromEntries(formulas.map(([key, formula]) => [key, formula.isServer]))
    return Object.fromEntries(Object.entries(obj).map(([key, v]) => [key, isServer[key] ? computed[key] : v]))
}

export {
    computeFormulas,
    computeServerFormulas,
}
