/// <reference types="chrome"/>
import { trace, traceData } from '../common/trace'
import { MessageHandlers } from './IMessagesHub'
import ChromePort from './chromePort'
import { IPort, PortHandlers } from './IPort'

//// Utils ////

function _setListener(port: chrome.runtime.Port, handlerMap: PortHandlers) {
    port.onMessage.addListener(async (m) => {
        const handler = handlerMap[m.name]
        if (handler) {
            const response = await handler(m)
            if (response && response.name) {
                try {
                    port.postMessage(response)
                } catch (e) {
                    trace('_setListener exception:')
                    traceData(e)
                }
            }
        }
    })
}

//// Messsages ////

// Send and receives message to between content, view and background

class ChromeMessagesClient {
    private registerName: string
    private port: chrome.runtime.Port
    private pendingMesssage: any

    constructor(registerName: string, portName: string, handlerMap: PortHandlers) {
        this.registerName = registerName

        chrome.runtime.onConnect.addListener(port => {
            if (port.name === portName) {
                trace(`ChromeMessagesClient connected: port '${portName}' registerName '${this.registerName}'`)
                _setListener(port, handlerMap)
                this.port = port
                if (this.pendingMesssage) {
                    this.port.postMessage(this.pendingMesssage)
                    this.pendingMesssage = undefined
                }
            }
        })

        this.connect()
    }

    private connect() {
        try {
            trace(`ChromeMessagesClient establishing connection: registerName '${this.registerName}'`)
            chrome.runtime.sendMessage({ name: this.registerName })
        } catch (e) {
            trace('ChromeMessagesClient.connect exception:')
            traceData(e)
        }
    }

    public send(name: string, data?: object): boolean {
        if (!this.port) {
            if (!this.pendingMesssage) {
                this.pendingMesssage = { name, ...data }
                this.connect()
                return true
            }
            else {
                trace(`ChromeMessagesClient.send message dropped: '${name}' on registerName '${this.registerName}'`)
                this.connect()
                return false
            }
        }

        try {
            this.port.postMessage({ name, ...data })
        } catch (e) {
            this.port = undefined
            trace('ChromeMessagesClient.send exception:')
            traceData(e)
            trace('trying to reconnect')
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
        trace(`ChromeMessagesHub connected: tab ${tabId} port '${portName}'`)
        _setListener(port, handlers)
        return new ChromePort(tabId, port)
    }

    public listen(handlers: MessageHandlers) {
        const callback = async (message: any,
            sender: chrome.runtime.MessageSender,
            _sendResponse: (response?: any) => void) => {

            const portManager = handlers[message.name]
            if (portManager) {
                trace(`ChromeMessagesHub.listen connection requested: tab ${sender.tab.id} title '${sender.tab.title}' registerName '${message.name}'`)
                await portManager.handle(sender.tab.id, sender.tab.title)
            } else {
                trace('ChromeMessagesHub.listen unknown message')
            }
        }

        chrome.runtime.onMessage.addListener(callback)
    }
}

export default ChromeMessagesHub
export {
    ChromeMessagesClient
}