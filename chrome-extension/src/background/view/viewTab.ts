import ITabManager from '../../chrome/ITab'
import {
    HTML_VIEW,
    MSG_NAME_ACTION_VIEW,
    MSG_NAME_NOTIFICATION_VIEW,
    MSG_NAME_REFRESH_VIEW
} from '../../common/const'
import IPortManager, { IPort } from '../../chrome/IPort'
import { trace, traceError } from '../../common/trace'
import ViewStateManager, { ViewState } from './viewState'

//// VIEW ////

class ViewTabManager {
    private portManager: IPortManager
    private stateManager: ViewStateManager
    private tabs: ITabManager

    constructor(portManager: IPortManager, stateManager: ViewStateManager, tabs: ITabManager) {
        this.portManager = portManager
        this.stateManager = stateManager
        this.tabs = tabs

        this.stateManager.onChange = async (state: ViewState) => {
            await this._refreshAll(state)
        }
    }

    public async onConnect(port: IPort): Promise<void> {
        await this._refreshOne(port)
    }

    public async onDisconnect(port: IPort): Promise<void> {
    }

    public async createOrOpenView(): Promise<void> {
        const isEmpty = await this.portManager.isEmpty()
        if (isEmpty) {
            await this.tabs.create(HTML_VIEW)
        } else {
            const tab = await this.portManager.firstTab()
            if (tab !== undefined)
                await tab.select()
        }
    }

    private async _sendMessage(port: IPort, name: string, data?: object) {
        try {
            port.send(name, data);
        } catch (e) {
            traceError('ViewTabManager', `.sendRefresh exception:`, e)
            this.portManager.remove(port)
            const isEmpty = await this.portManager.isEmpty()
            if (isEmpty) {
                trace('ViewTabManager', 'create view')
                this.tabs.create(HTML_VIEW)
            }
        }
    }

    private async _refreshOne(port: IPort): Promise<void> {
        const state = await this.stateManager.get()
        await this._sendMessage(port, MSG_NAME_REFRESH_VIEW, state)
    }

    private async _refreshAll(state: ViewState): Promise<void> {
        const portList = await this.portManager.all()
        const that = this
        await Promise.all(portList.map(port => that._sendMessage(port, MSG_NAME_REFRESH_VIEW, state)))
    }

    public async sendDispatch(action: string): Promise<void> {
        const portList = await this.portManager.all()
        const that = this
        await Promise.all(portList.map(port => that._sendMessage(port, MSG_NAME_ACTION_VIEW, { action })))
    }

    public async sendNotificationClicked(notificationId: string): Promise<void> {
        const portList = await this.portManager.all()
        const that = this
        await Promise.all(portList.map(port => that._sendMessage(port, MSG_NAME_NOTIFICATION_VIEW, { notificationId })))
    }
}

export default ViewTabManager