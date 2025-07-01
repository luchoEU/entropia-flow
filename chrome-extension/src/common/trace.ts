let _indent: number = 0
let _tid: string = '' // trace id, usually a letter
let _traceOn = true

enum Component {
    AppLoader,
    ChromeMessagesClient,
    ChromeMessagesHub,
    ChromeStorageArea,
    ChromeTabManager,
    ContentTabManager,
    CraftMiddleware,
    HelpersMiddleware,
    InventoryReader,
    InventoryStorage,
    ItemsReader,
    Notifications,
    PortManager,
    ReduxLogger,
    RefreshItem,
    RefreshManager,
    SheetMiddleware,
    ViewTabManager,
    WebSocketClient,
}

const silentComponents = new Set([
    Component.ChromeMessagesClient,
    Component.ChromeMessagesHub,
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
    console.log(`${sp}${new Date().toLocaleTimeString()} .${_indent}${_tid}. ${Component[component]}.${message}`)
}

function traceId(id: string) {
    _tid = id
    console.log(`Trace ID: ${_tid}, silent components: ${Array.from(silentComponents).map(n => Component[n]).join(', ')}`)
}

function trace(component: Component, message: string, data?: any) {
    if (traceEnabled(component)) {
        _trace(component, message)
        if (data)
            console.log(data)
    }
}

function traceError(component: Component, message: string, error?: any) {
    if (_traceOn) {
        _trace(component, message);
        if (error)
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
    traceEnd,
}
