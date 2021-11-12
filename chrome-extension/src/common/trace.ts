let indent: number = 0
let tid: string = '' // trace id, usually a letter
let TRACE_ON = true

function _trace(message: string) {
    let sp = ''
    for (let n: number = 0; n < indent; n++)
        sp += '  '
    console.log(`${sp}${new Date().toLocaleTimeString()} .${indent}${tid}. ${message}`)
}

function trace(message: string) {
    if (TRACE_ON) {
        _trace(message)
    }
}

function traceId(id: string) {
    tid = id
}

function traceStart(message: string) {
    if (TRACE_ON) {
        if (indent == 0)
            _trace(`Start ${message}`)
        else
            _trace(`start ${message}`)
        indent++
    }
}

function traceEnd(message: string) {
    if (TRACE_ON) {
        indent--
        if (indent == 0)
            _trace(`End ${message}`)
        else
            _trace(`end ${message}`)
    }
}

function traceData(data: any) {
    if (TRACE_ON) {
        console.log(data)
    }
}

function traceOff() {
    TRACE_ON = false
}

export {
    traceOff,
    trace,
    traceId,
    traceStart,
    traceEnd,
    traceData
}