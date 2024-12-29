import StreamRenderData from "./data"

function getDelta(source: StreamRenderData, final: StreamRenderData): StreamRenderData {
    if (source === undefined)
        return final

    function f(src: object, end: object): object {
        const res = { }
        Object.entries(src).forEach(([k, v]) => {
            if (end[k] === undefined || typeof v !== 'object')
                res[k] = v
            else if (end[k] !== v) {
                res[k] = f(v, end[k])
            }
        })
        return res
    }
    return f(source, final) as StreamRenderData
}

function applyDelta(source: StreamRenderData, delta: StreamRenderData): StreamRenderData {
    if (source === undefined)
        return delta

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
    return f(source, delta) as StreamRenderData
}

export {
    getDelta,
    applyDelta
}
