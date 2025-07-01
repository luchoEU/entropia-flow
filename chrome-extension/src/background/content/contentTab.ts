/// <reference types="chrome"/>
import IPortManager, { IPort } from '../../chrome/IPort'
import {
    MSG_NAME_REFRESH_ITEMS_AJAX,
    MSG_NAME_REFRESH_CONTENT,
    STRING_CONNECTION_BACKGROUND_TO_CONTENT,
    STRING_PLEASE_LOG_IN,
    MSG_NAME_REFRESH_WAKE_UP
} from '../../common/const'
import { Component, trace, traceError } from '../../common/trace'
import { IContentTab } from './refreshManager'

//// CONTENT TAB ////

class ContentTabManager implements IContentTab {
    private portManager: IPortManager
    public onConnected: () => Promise<void>
    public onDisconnected: () => Promise<void>

    constructor(portManager: IPortManager) {
        this.portManager = portManager
    }

    public async onConnect(port: IPort): Promise<void> {
        if (this.onConnected)
            await this.onConnected()
    }

    public async onDisconnect(port: IPort): Promise<void> {
        if (this.onDisconnected)
            await this.onDisconnected()
    }

    private async _send(logName: string, messageName: string, data?: object): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            chrome.tabs.query({ url: "https://account.entropiauniverse.com/account/my-account/*" }, async (tabs) => {
                trace(Component.ContentTabManager, `${logName} found ${tabs.length} tabs`)
                let anyDiscarded = false
                for (const tab of tabs) {
                    if (tab.discarded) {
                        trace(Component.ContentTabManager, `${logName} reload tab ${tab.id}`)
                        chrome.tabs.reload(tab.id, {}, () => { });
                        anyDiscarded = true
                    }
                }
                if (anyDiscarded) {
                    resolve(undefined)
                }

                const port = await this.portManager.first()
                if (port === undefined) {
                    trace(Component.ContentTabManager, `${logName} port undefined`)
                    resolve(STRING_PLEASE_LOG_IN)
                } else {
                    try {
                        trace(Component.ContentTabManager, `${logName} sent message ${messageName}`)
                        port.send(messageName)
                        resolve(undefined)
                    } catch (e) {
                        if (e.message === 'Attempting to use a disconnected port object') {
                            // expected fail
                            trace(Component.ContentTabManager, `${logName} send failed`)
                        } else {
                            traceError(Component.ContentTabManager, `${logName} exception:`, e)
                        }
                        resolve(STRING_CONNECTION_BACKGROUND_TO_CONTENT) // STRING_PLEASE_LOG_IN
                    }
                }
            })
        })
    }

    public async requestItems(tag?: any, waitSeconds?: number, forced?: boolean): Promise<string> {
        return this._send('requestItems', MSG_NAME_REFRESH_ITEMS_AJAX, { tag, waitSeconds, forced })
    }

    public async wakeUp() {
        this._send('wakeUp', MSG_NAME_REFRESH_WAKE_UP)
    }

    async setStatus(isMonitoring: boolean) {
        const ports = await this.portManager.all()
        ports.forEach(port => port.send(MSG_NAME_REFRESH_CONTENT, { isMonitoring }))
    }
}

export default ContentTabManager
