/// <reference types="chrome"/>
import { Component, trace, traceError } from '../common/trace'
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

function _setListener(port: chrome.runtime.Port, handlersMap: PortHandlers, messageSender: IMessageSender, component: Component, endPointName: string) {
    port.onMessage.addListener(async (m, p) => {
        trace(component, `_setListener received: '${m.name}' ${endPointName}`)
        const handler = PING_HANDLER[m.name] ?? handlersMap?.[m.name]
        if (handler) {
            const response = await handler(m, messageSender)
            if (response && response.name) {
                try {
                    trace(component, `_setListener response: '${response.name}' ${endPointName}`)
                    p.postMessage(response)
                } catch (e) {
                    traceError(component, '_setListener exception:', e)
                }
            }
        }
    })
}

//// Messsages ////

// Send and receives message to between content, view and background

class ChromeMessagesClient implements IMessageSender {
    private registerName: string
    private port?: chrome.runtime.Port
    private pendingMesssage: any

    constructor(registerName: string, portName: string, handlersMap: PortHandlers) {
        this.registerName = registerName

        chrome.runtime.onConnect.addListener(port => {
            if (port.name === portName) {
                trace(Component.ChromeMessagesClient, `connected: port '${portName}' registerName '${this.registerName}'`)
                _setListener(port, handlersMap, this, Component.ChromeMessagesClient, `registerName '${registerName}'`)
                this.port = port
                if (this.pendingMesssage) {
                    trace(Component.ChromeMessagesClient, `send: pending '${this.pendingMesssage.name}' on registerName '${this.registerName}'`)
                    this.port.postMessage(this.pendingMesssage)
                    this.pendingMesssage = undefined
                }
                this.send('ping') // test connection after getting the port
            }
        })

        this.tryConnect()
    }

    private lastConnectAttempt = 0;

    private tryConnect() {
        const now = Date.now();
        if (now - this.lastConnectAttempt < 5000) {
            trace(Component.ChromeMessagesClient, 'too soon, skipping connect')
            return;
        }

        this.lastConnectAttempt = now;

        trace(Component.ChromeMessagesClient, `establishing connection: registerName '${this.registerName}'`)
        chrome.runtime.sendMessage({ name: this.registerName }, (response: any) => {
            const str = (n: string, x: any) => x ? `${n}: ${JSON.stringify(x)}` : `no ${n}`
            trace(Component.ChromeMessagesClient, `connect ${str('response', response)} ${str('lastError', chrome.runtime.lastError)}`)
        })
    }

    public send(name: string, data?: object): boolean {
        if (!this.port) {
            if (!this.pendingMesssage) {
                trace(Component.ChromeMessagesClient, `reconnect, message pending: '${name}' on registerName '${this.registerName}'`)
                this.pendingMesssage = { name, ...data }
                this.tryConnect()
                return true
            }
            else {
                trace(Component.ChromeMessagesClient, `reconnect, message dropped: '${name}' on registerName '${this.registerName}'`)
                this.tryConnect()
                return false
            }
        }

        try {
            trace(Component.ChromeMessagesClient, `send: '${name}' on registerName '${this.registerName}'`)
            this.port.postMessage({ name, ...data })
        } catch (e) {
            this.port = undefined
            traceError(Component.ChromeMessagesClient, 'send exception:', e)
            trace(Component.ChromeMessagesClient, 'trying to reconnect')
            this.pendingMesssage = { name, ...data }
            this.tryConnect()
        }

        return true
    }
}


// listen to register requests and open a port with the tab

class ChromeMessagesHub {
    public connect(tabId: number, portName: string, handlers: PortHandlers): IPort {
        const port = chrome.tabs.connect(tabId, { name: portName })
        trace(Component.ChromeMessagesHub, `connected: tab ${tabId} port '${portName}'`)
        _setListener(port, handlers, undefined!, Component.ChromeMessagesHub, `port '${portName}'`)
        chrome.tabs.update(tabId, { autoDiscardable: false })
        return new ChromePort(tabId, port)
    }

    public listen(handlers: MessageHandlers) {
        const callback = async (message: any,
            sender: chrome.runtime.MessageSender,
            sendResponse: (response?: any) => void) => {
            const portManager = handlers[message.name]
            if (portManager) {
                trace(Component.ChromeMessagesHub, `listen connection requested: tab ${sender.tab.id} title '${sender.tab.title}' registerName '${message.name}'`)
                await portManager.handle(sender.tab.id, sender.tab.title)
                sendResponse({ result: 'connected' })
            } else {
                trace(Component.ChromeMessagesHub, 'listen unknown name in message')
                sendResponse({ result: 'unknown name', failed: true })
            }
        }

        trace(Component.ChromeMessagesHub, 'listening')
        chrome.runtime.onMessage.addListener(callback)
        // chrome.runtime.sendMessage({name: "test"}, (response) => { console.log(response); console.log(chrome.runtime.lastError) })
    }
}

export default ChromeMessagesHub
export {
    ChromeMessagesClient
}
