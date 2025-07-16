import { TemporalValue } from "../common/state";
import { StreamUserImageVariable } from "../view/application/state/stream";
import { StreamRenderObject } from "./data";
import { cycleErrorFormula, Formula, parseFormula } from "./formulaParser";

function _parseFormulas(obj: StreamRenderObject): [string, Formula][] {
    let formulas: [string, Formula][] = Object.entries(obj)
        .filter(([, value]) => typeof value === 'string' && value.startsWith('='))
        .map(([key, value]: [string, any]): [string, Formula] => [key, parseFormula(value.slice(1))]);

    const sortedFromulas: [string, Formula][] = [];
    while (formulas.length) {
        const usedVariables = formulas.reduce((s, [, formula]) => s.size === 0 ? formula.usedVariables : new Set([...s, ...formula.usedVariables]), new Set());
        const notUsedFormulas = formulas.filter(([key]) => !usedVariables.has(key));
        if (notUsedFormulas.length === 0) {
            // circular references
            const keys = new Set(formulas.map(([key,]) => key));
            sortedFromulas.unshift(...formulas.map(([key, formula]): [string, Formula] =>
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
    const formulaWithError: string[] = []
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

function filterUsedVariables(variables: StreamUserImageVariable[], usedVariables: Set<string>): StreamUserImageVariable[] {
    let formulas = Object.fromEntries(variables
        .filter((v) => typeof v.value === 'string' && v.value.startsWith('='))
        .map((v): [string, Formula] => [v.name, parseFormula(v.value.slice(1))]))

    const toFilterList = new Set<string>();
    function addVariables(vars: Set<string>) {
        for (const v of vars) {
            if (!toFilterList.has(v)) {
                toFilterList.add(v);
                const f = formulas[v];
                if (f) {
                    addVariables(f.usedVariables);
                }
            }
        }
    }
    addVariables(usedVariables);

    return variables.filter((v) => toFilterList.has(v.name));
}

function computeFormulas(obj: StreamRenderObject, temporalVariables?: Record<string, TemporalValue>): StreamRenderObject {
    return _computeFormulas(_parseFormulas(obj), obj, temporalVariables ?? {});
}

export {
    computeFormulas,
    filterUsedVariables,
}
