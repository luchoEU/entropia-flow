/// <reference types="chrome"/>
import IPortManager, { IPort } from '../../chrome/IPort'
import {
    MSG_NAME_REFRESH_ITEMS_AJAX,
    MSG_NAME_REFRESH_CONTENT,
    STRING_CONNECTION_BACKGROUND_TO_CONTENT,
    STRING_PLEASE_LOG_IN,
    MSG_NAME_REFRESH_WAKE_UP,
    STRING_SELECT_ITEMS_TAB
} from '../../common/const'
import { Component, trace, traceError } from '../../common/trace'
import { isUnfreezeTabEnabled } from '../settings/featureSettings'
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

    private _unfreezeTab(tab: chrome.tabs.Tab, logName: string) {
        isUnfreezeTabEnabled().then(async (enabled) => {
            if (!enabled) return
            const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
            chrome.tabs.update(tab.id, { active: true }, () => {
                trace(Component.ContentTabManager, `${logName} tab activated since it was frozen`);
                if (currentTab && currentTab.id !== tab.id) {
                    chrome.tabs.update(currentTab.id!, { active: true }); // restore the previous tab
                }
            });
        })
    }

    private async _send(logName: string, messageName: string, data?: object): Promise<string> {
        const port = await this.portManager.first()
        if (port === undefined) {
            trace(Component.ContentTabManager, `${logName} port undefined`)
            return STRING_PLEASE_LOG_IN
        } else {
            const tab = await chrome.tabs.get(port.getTabId())
            if (tab.discarded) {
                trace(Component.ContentTabManager, `${logName} reload tab ${tab.id}`)
                chrome.tabs.reload(tab.id, {}, () => { });
                return undefined
            }
            if (tab.frozen) {
                this._unfreezeTab(tab, logName)
                return STRING_SELECT_ITEMS_TAB
            }

            try {
                trace(Component.ContentTabManager, `${logName} sent message ${messageName}`)
                port.send(messageName)
                return undefined
            } catch (e) {
                if (e.message === 'Attempting to use a disconnected port object') {
                    // expected fail
                    trace(Component.ContentTabManager, `${logName} send failed`)
                } else {
                    traceError(Component.ContentTabManager, `${logName} exception:`, e)
                }
                return STRING_CONNECTION_BACKGROUND_TO_CONTENT // STRING_PLEASE_LOG_IN
            }
        }
    }

    public async checkFrozen(): Promise<boolean> {
        const port = await this.portManager.first()
        if (port === undefined) {
            trace(Component.ContentTabManager, 'checkFrozen port undefined')
            return true
        } else {
            const tab = await chrome.tabs.get(port.getTabId())
            if (tab.frozen) {
                this._unfreezeTab(tab, 'checkFrozen')
                return true
            }
            return false
        }
    }

    public async requestItems(tag?: any, waitSeconds?: number, forced?: boolean): Promise<string> {
        return this._send('requestItems', MSG_NAME_REFRESH_ITEMS_AJAX, { tag, waitSeconds, forced })
    }

    public async wakeUp(): Promise<boolean> {
        return (await this._send('wakeUp', MSG_NAME_REFRESH_WAKE_UP)) === undefined
    }

    public async setStatus(isMonitoring: boolean): Promise<void> {
        const ports = await this.portManager.all()
        ports.forEach(port => port.send(MSG_NAME_REFRESH_CONTENT, { isMonitoring }))
    }
}

export default ContentTabManager
