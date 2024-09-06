/// <reference types="chrome"/>
import { trace, traceData } from '../common/trace'
import { MessageHandlers } from './messagesInterface'
import { ChromePort } from './portChrome'
import { IPort, PortHandlers } from './portInterface'

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

class ChromeMessagesClient {
    private registerName: string
    private port: chrome.runtime.Port
    private pendingMesssage: any

    constructor(registerName: string, portName: string, handlerMap: PortHandlers) {
        this.registerName = registerName

        chrome.runtime.onConnect.addListener(port => {
            if (port.name === portName) {
                _setListener(port, handlerMap)
                this.port = port
                if (this.pendingMesssage) {
                    this.port.postMessage(this.pendingMesssage)
                    this.pendingMesssage = undefined
                }
            }
        })

        chrome.runtime.sendMessage({ name: this.registerName })
    }

    public send(name: string, data?: object): boolean {
        if (!this.port) {
            if (!this.pendingMesssage) {
                this.pendingMesssage = { name, ...data }
                chrome.runtime.sendMessage({ name: this.registerName })
                return true
            }
            else {
                trace(`ChromeMessagesClient.send message dropped: '${name}' on ${this.registerName}`)
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
            chrome.runtime.sendMessage({ name: this.registerName })
        }

        return true
    }
}

class ChromeMessagesHub {
    public connect(tabId: number, portName: string, handlers: PortHandlers): IPort {
        const port = chrome.tabs.connect(tabId, { name: portName })
        _setListener(port, handlers)
        return new ChromePort(tabId, port)
    }

    public listen(handlers: MessageHandlers) {
        const callback = async (message: any,
            sender: chrome.runtime.MessageSender,
            _sendResponse: (response?: any) => void) => {

            const portManager = handlers[message.name]
            if (portManager) {
                await portManager.handle(sender.tab.id)
            } else {
                trace('ChromeMessagesClient.listen unknown message')
            }
        }

        chrome.runtime.onMessage.addListener(callback)
    }
}

export default ChromeMessagesHub
export {
    ChromeMessagesClient
}