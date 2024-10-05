import ITabManager from '../../chrome/tabsInterface'
import {
    HTML_VIEW,
    MSG_NAME_REFRESH_VIEW
} from '../../common/const'
import IPortManager, { IPort } from '../../chrome/portInterface'
import { trace, traceData } from '../../common/trace'
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
            this.tabs.create(HTML_VIEW)
        } else {
            const tab = await this.portManager.firstTab()
            if (tab !== undefined)
                tab.select()
        }
    }

    private async sendRefresh(port: IPort, state: ViewState) {
        try {
            port.send(MSG_NAME_REFRESH_VIEW, state);
        } catch (e) {
            trace(`ViewTabManage.sendRefresh exception:`)
            traceData(e)
            this.portManager.remove(port)
            const isEmpty = await this.portManager.isEmpty()
            if (isEmpty) {
                trace('create view')
                this.tabs.create(HTML_VIEW)
            }
        }
    }

    private async _refreshOne(port: IPort): Promise<void> {
        const state = await this.stateManager.get()
        await this.sendRefresh(port, state)
    }

    private async _refreshAll(state: ViewState): Promise<void> {
        const portList = await this.portManager.all()
        Promise.all(portList.map(port => this.sendRefresh(port, state)))
    }
}

export default ViewTabManager