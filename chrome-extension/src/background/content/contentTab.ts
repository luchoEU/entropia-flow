/// <reference types="chrome"/>
import IPortManager, { IPort } from '../../chrome/IPort'
import {
    MSG_NAME_REFRESH_ITEMS_AJAX,
    MSG_NAME_REFRESH_CONTENT,
    STRING_CONNECTION_BACKGROUND_TO_CONTENT,
    STRING_PLEASE_LOG_IN
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

    public async requestItems(tag?: any, waitSeconds?: number, forced?: boolean): Promise<string> {
        const port = await this.portManager.first()
        if (port === undefined) {
            trace(Component.ContentTabManager, 'requestItems port undefined')
            return STRING_PLEASE_LOG_IN
        } else {
            try {
                const name = MSG_NAME_REFRESH_ITEMS_AJAX
                trace(Component.ContentTabManager, `requestItems send ${name}`)
                port.send(name, { tag, waitSeconds, forced })
                return undefined
            } catch (e) {
                if (e.message === 'Attempting to use a disconnected port object') {
                    // expected fail
                    trace(Component.ContentTabManager, 'requestItems send failed')
                } else {
                    traceError(Component.ContentTabManager, 'requestItems exception:', e)
                }
                return STRING_CONNECTION_BACKGROUND_TO_CONTENT // STRING_PLEASE_LOG_IN
            }
        }
    }

    async setStatus(isMonitoring: boolean) {
        const ports = await this.portManager.all()
        ports.forEach(port => port.send(MSG_NAME_REFRESH_CONTENT, { isMonitoring }))
    }
}

export default ContentTabManager
