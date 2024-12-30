function getDelta<T extends object>(source: T, final: T): Partial<T> {
    if (source === undefined)
        return final

    function f(src: object, end: object): object {
        const res = { }
        Object.entries(src).forEach(([k, v]) => {
            if (end[k] === undefined)
                res[k] = v
            else if (typeof v !== 'object')
                res[k] = end[k]
            else if (end[k] !== v) {
                res[k] = f(v, end[k])
            }
        })
        return res
    }
    return f(source, final) as Partial<T>
}

function applyDelta<T extends object>(source: T, delta: Partial<T>): T {
    if (source === undefined)
        return delta as T

    function f(src: object, dif: object): object {
        const res = JSON.parse(JSON.stringify(src))
        Object.entries(dif).forEach(([k, v]) => {
            if (res[k] === undefined || typeof v !== 'object')
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
