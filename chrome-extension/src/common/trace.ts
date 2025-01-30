let _indent: number = 0
let _tid: string = '' // trace id, usually a letter
let _traceOn = true

const silentComponents = new Set([
    'ChromeMessagesClient',
    'PortManager',
    'ChromeMessagesHub',
])

function _trace(component: string, message: string) {
    let sp = ''
    for (let n: number = 0; n < _indent; n++)
        sp += '  '
    console.log(`${sp}${new Date().toLocaleTimeString()} .${_indent}${_tid}. ${component}.${message}`)
}

function traceId(id: string) {
    _tid = id
}

function trace(component: string, message: string) {
    if (_traceOn && !silentComponents.has(component)) {
        _trace(component, message)
    }
}

function traceData(component: string, message: string, error: any) {
    if (_traceOn && !silentComponents.has(component)) {
        _trace(component, message);
        console.log(error)
    }
}

function traceError(component: string, message: string, error: any) {
    if (_traceOn) {
        _trace(component, message);
        console.log(error)
    }
}

function traceStart(component: string, message: string) {
    if (_traceOn) {
        _trace(component, `${_indent ? 's' : 'S'}tart ${message}`)
        _indent++
    }
}

function traceEnd(component: string, message: string) {
    if (_traceOn) {
        _indent--
        _trace(component, `${_indent ? 'e' : 'E'}nd ${message}`)
    }
}

function traceOff() {
    _traceOn = false
}

export {
    traceOff,
    traceId,
    trace,
    traceError,
    traceStart,
    traceData,
    traceEnd,
}
