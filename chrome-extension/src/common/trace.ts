let _indent: number = 0
let _tid: string = '' // trace id, usually a letter
let _traceOn = true

enum Component {
    ChromeMessagesClient = 'ChromeMessagesClient',
    ChromeMessagesHub = 'ChromeMessagesHub',
    ContentTabManager = 'ContentTabManager',
    PortManager = 'PortManager',
    WebSocketClient = 'WebSocketClient',
    ReduxLogger = 'ReduxLogger',
    SheetMiddleware = 'SheetMiddleware',
    HelpersMiddleware = 'HelpersMiddleware',
    CraftMiddleware = 'CraftMiddleware',
    ItemsReader = 'ItemsReader',
    RefreshItem = 'RefreshItem',
    ChromeTabManager = 'ChromeTabManager',
    ViewTabManager = 'ViewTabManager',
    ChromeStorageArea = 'ChromeStorageArea',
    InventoryStorage = 'InventoryStorage',
    InventoryReader = 'InventoryReader',
    RefreshManager = 'RefreshManager',
}

const silentComponents = new Set([
    Component.ChromeMessagesClient,
    Component.ChromeMessagesHub,
    Component.ContentTabManager,
    Component.PortManager,
    Component.WebSocketClient,
    Component.ReduxLogger,
])

function traceEnabled(component: Component) {
    return _traceOn && !silentComponents.has(component)
}

function _trace(component: Component, message: string) {
    let sp = ''
    for (let n: number = 0; n < _indent; n++)
        sp += '  '
    console.log(`${sp}${new Date().toLocaleTimeString()} .${_indent}${_tid}. ${component}.${message}`)
}

function traceId(id: string) {
    _tid = id
}

function trace(component: Component, message: string) {
    if (traceEnabled(component)) {
        _trace(component, message)
    }
}

function traceData(component: Component, message: string, error: any) {
    if (traceEnabled(component)) {
        _trace(component, message);
        console.log(error)
    }
}

function traceError(component: Component, message: string, error: any) {
    if (_traceOn) {
        _trace(component, message);
        console.log(error)
    }
}

function traceStart(component: Component, message: string) {
    if (_traceOn) {
        _trace(component, `${_indent ? 's' : 'S'}tart ${message}`)
        _indent++
    }
}

function traceEnd(component: Component, message: string) {
    if (_traceOn) {
        _indent--
        _trace(component, `${_indent ? 'e' : 'E'}nd ${message}`)
    }
}

function traceOff() {
    _traceOn = false
}

export {
    Component,
    traceOff,
    traceId,
    trace,
    traceEnabled,
    traceError,
    traceStart,
    traceData,
    traceEnd,
}
