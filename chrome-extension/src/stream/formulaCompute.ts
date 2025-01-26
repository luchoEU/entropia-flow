import { TemporalValue } from "../common/state";
import { StreamRenderObject } from "./data";
import { Formula, parseFormula } from "./formulaParser";

function _parseFormulas(obj: StreamRenderObject): [string, Formula][] {
    return Object.entries(obj)
    .filter(([, value]) => typeof value === 'string' && value.startsWith('='))
    .map(([key, value]: [string, string]): [string, Formula] => [key, parseFormula(value.slice(1))])
    .sort(([ka, fa], [kb, fb]) => fa.usedVariables.has(kb) ? -1 : (fb.usedVariables.has(ka) ? 1 : 0))
}

function _computeFormulas(formulas: [string, Formula][], obj: StreamRenderObject, temporalData: Record<string, TemporalValue>): StreamRenderObject {
    return formulas.reduce((v, [key, formula]) => {
        v[key] = formula.evaluate(v, temporalData)
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
