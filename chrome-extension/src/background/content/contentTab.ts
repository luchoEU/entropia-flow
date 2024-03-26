import IPortManager, { IPort } from '../../chrome/portInterface'
import {
    CLASS_INFO,
    CLASS_ERROR,
    STRING_PLEASE_LOG_IN,
    STRING_LOADING,
    MSG_NAME_REFRESH_ITEMS_HTML,
    MSG_NAME_REFRESH_ITEMS_AJAX,
    MSG_NAME_REFRESH_CONTENT
} from '../../common/const'
import { trace, traceData } from '../../common/trace'

//// CONTENT TAB ////

class ContentTabManager {
    private portManager: IPortManager
    public onMessage: (_class: string, message: string) => Promise<void>

    constructor(portManager: IPortManager) {
        this.portManager = portManager
    }

    private async _setViewStatus(_class: string, message: string) {
        if (this.onMessage)
            await this.onMessage(_class, message)
    }

    public async onConnect(port: IPort): Promise<void> {
        await this._setViewStatus(CLASS_INFO, undefined)
    }

    public async onDisconnect(port: IPort): Promise<void> {
        await this._setViewStatus(CLASS_ERROR, STRING_PLEASE_LOG_IN)
    }

    public async requestItemsHtml(): Promise<void> {
        const port = await this.portManager.first()
        if (port !== undefined) {
            try {
                port.send(MSG_NAME_REFRESH_ITEMS_HTML, { })
            } catch (e) {
                if (e.message === 'Attempting to use a disconnected port object') {
                    // expected fail
                    trace('ContentTabManager.requestItems send failed')
                } else {
                    trace('ContentTabManager.requestItems exception:')
                    traceData(e)
                }
            }
        }
    }

    public async requestItemsAjax(tag?: any, waitSeconds?: number): Promise<void> {
        const port = await this.portManager.first()
        if (port !== undefined) {
            try {
                port.send(MSG_NAME_REFRESH_ITEMS_AJAX, { tag, waitSeconds })
                await this._setViewStatus(CLASS_INFO, STRING_LOADING)
            } catch (e) {
                if (e.message === 'Attempting to use a disconnected port object') {
                    // expected fail
                    trace('ContentTabManager.requestItems send failed')
                } else {
                    trace('ContentTabManager.requestItems exception:')
                    traceData(e)
                }
                await this._setViewStatus(CLASS_ERROR, STRING_PLEASE_LOG_IN)
            }
        } else {
            await this._setViewStatus(CLASS_ERROR, STRING_PLEASE_LOG_IN)
        }
    }

    async setStatus(isMonitoring: boolean) {
        const ports = await this.portManager.all()
        ports.forEach(port => port.send(MSG_NAME_REFRESH_CONTENT, { isMonitoring }))
    }
}

export default ContentTabManager