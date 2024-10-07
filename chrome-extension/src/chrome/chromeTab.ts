/// <reference types="chrome"/>

import { trace, traceData } from "../common/trace";
import ITabManager, { ITab } from "./ITab";

class ChromeTab implements ITab {
    private tabId: number

    constructor(tabId: number) {
        this.tabId = tabId
    }

    async select() {
        await chrome.tabs.update(this.tabId, { selected: true })
    }
}

class ChromeTabManager implements ITabManager {
    public async create(_url: string): Promise<ITab> {
        const url = chrome.runtime.getURL(_url)
        const tab = await chrome.tabs.create({ url })
        return new ChromeTab(tab.id)
    }

    public async get(tabId: number): Promise<ITab> {
        try {
            const res = await chrome.tabs.get(tabId)
            return res === undefined ? undefined : new ChromeTab(tabId)
        } catch (e) {
            trace('ChromeTabManager.get exception:')
            traceData(e)
            return undefined
        }
    }
}

export default ChromeTabManager