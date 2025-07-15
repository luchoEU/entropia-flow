function getDelta<T extends object>(source: T | undefined, final: T): Partial<T> {
    if (source === undefined)
        return final;

    function f(src: object, end: object): object | undefined {
        const res = { };
        Object.entries(src).forEach(([k, v]) => {
            if (end[k] === undefined) {
                res[k] = null;
            } else if (!Array.isArray(v) && typeof v === 'object') {
                const obj = f(v, end[k]);
                if (obj !== undefined)
                    res[k] = obj;
            } else if (end[k] !== v) {
                res[k] = end[k];
            }
        });
        Object.entries(end)
            .filter(([k,]) => !(k in src))
            .forEach(([k, v]) =>res[k] = v);
        return Object.keys(res).length === 0 ? undefined : res;
    }
    return f(source, final) as Partial<T>;
}

function applyDelta<T extends object>(source: T | undefined, delta: Partial<T>): T {
    if (source === undefined)
        return delta as T

    function f(src: object, dif: object): object {
        const res = { ...src }
        Object.entries(dif).forEach(([k, v]) => {
            if (v === null)
                delete res[k]
            else if (res[k] === undefined || Array.isArray(v) || typeof v !== 'object')
                res[k] = v
            else if (src[k] !== v) {
                res[k] = f(src[k], v)
            }
        })
        return res
    }
    return f(source, delta) as T
}

export {
    getDelta,
    applyDelta
}
