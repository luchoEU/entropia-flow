/// <reference types="chrome"/>
import { trace, traceError } from '../common/trace'
import { MessageHandlers } from './IMessagesHub'
import ChromePort from './chromePort'
import { IMessageSender, IPort, PortHandlers } from './IPort'

//// Listeners ////

const PING_HANDLER: PortHandlers = {
    ping: async () => ({ name: 'pong' }),
    pong: async (_, sender) => {
        // Reply before 30 seconds to keep background service worker alive
        setTimeout(() => {
            sender.send('ping');
        }, 25000);
        return null;
    }
}

function _setListener(port: chrome.runtime.Port, handlerMap: PortHandlers, messageSender: IMessageSender, className: string, endPointName: string) {
    port.onMessage.addListener(async (m, p) => {
        trace(className, `_setListener received: '${m.name}' ${endPointName}`)
        const handler = PING_HANDLER[m.name] ?? handlerMap[m.name]
        if (handler) {
            const response = await handler(m, messageSender)
            if (response && response.name) {
                try {
                    trace(className, `_setListener response: '${response.name}' ${endPointName}`)
                    p.postMessage(response)
                } catch (e) {
                    traceError(className, '_setListener exception:', e)
                }
            }
        }
    })
}

//// Messsages ////

// Send and receives message to between content, view and background

class ChromeMessagesClient implements IMessageSender {
    private registerName: string
    private port: chrome.runtime.Port
    private pendingMesssage: any

    constructor(registerName: string, portName: string, handlerMap: PortHandlers) {
        this.registerName = registerName

        chrome.runtime.onConnect.addListener(port => {
            if (port.name === portName) {
                trace('ChromeMessagesClient', `connected: port '${portName}' registerName '${this.registerName}'`)
                _setListener(port, handlerMap, this, 'ChromeMessagesClient', `registerName '${registerName}'`)
                this.port = port
                if (this.pendingMesssage) {
                    trace('ChromeMessagesClient', `send: pending '${this.pendingMesssage.name}' on registerName '${this.registerName}'`)
                    this.port.postMessage(this.pendingMesssage)
                    this.pendingMesssage = undefined
                }
            }
        })

        this.connect()
    }


    private connect() {
        trace('ChromeMessagesClient', `establishing connection: registerName '${this.registerName}'`)
        chrome.runtime.sendMessage({ name: this.registerName }, (response: any) => {
            const str = (n: string, x: any) => x ? `${n}: ${JSON.stringify(x)}` : `no ${n}`
            trace('ChromeMessagesClient', `connect ${str('response', response)} ${str('lastError', chrome.runtime.lastError)}`)
            this.send('ping') // test connection
        })
    }

    public send(name: string, data?: object): boolean {
        if (!this.port) {
            if (!this.pendingMesssage) {
                trace('ChromeMessagesClient', `reconnect, message pending: '${name}' on registerName '${this.registerName}'`)
                this.pendingMesssage = { name, ...data }
                this.connect()
                return true
            }
            else {
                trace('ChromeMessagesClient', `reconnect, message dropped: '${name}' on registerName '${this.registerName}'`)
                this.connect()
                return false
            }
        }

        try {
            trace('ChromeMessagesClient', `send: '${name}' on registerName '${this.registerName}'`)
            this.port.postMessage({ name, ...data })
        } catch (e) {
            this.port = undefined
            traceError('ChromeMessagesClient', 'send exception:', e)
            trace('ChromeMessagesClient', 'trying to reconnect')
            this.pendingMesssage = { name, ...data }
            this.connect()
        }

        return true
    }
}


// listen to register requests and open a port with the tab

class ChromeMessagesHub {
    public connect(tabId: number, portName: string, handlers: PortHandlers): IPort {
        const port = chrome.tabs.connect(tabId, { name: portName })
        trace('ChromeMessagesHub', `connected: tab ${tabId} port '${portName}'`)
        _setListener(port, handlers, undefined, 'ChromeMessagesHub', `port '${portName}'`)
        return new ChromePort(tabId, port)
    }

    public listen(handlers: MessageHandlers) {
        const callback = async (message: any,
            sender: chrome.runtime.MessageSender,
            sendResponse: (response?: any) => void) => {
            const portManager = handlers[message.name]
            if (portManager) {
                trace('ChromeMessagesHub', `listen connection requested: tab ${sender.tab.id} title '${sender.tab.title}' registerName '${message.name}'`)
                await portManager.handle(sender.tab.id, sender.tab.title)
                sendResponse({ result: 'connected' })
            } else {
                trace('ChromeMessagesHub', 'listen unknown name in message')
                sendResponse({ result: 'unknown name', failed: true })
            }
        }

        trace('ChromeMessagesHub', 'listening')
        chrome.runtime.onMessage.addListener(callback)
        // chrome.runtime.sendMessage({name: "test"}, (response) => { console.log(response); console.log(chrome.runtime.lastError) })
    }
}

export default ChromeMessagesHub
export {
    ChromeMessagesClient
}
