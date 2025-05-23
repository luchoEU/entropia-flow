/// <reference types="chrome"/>

import { Component, traceError } from "../common/trace";
import ITabManager, { ITab } from "./ITab";

class ChromeTab implements ITab {
    private tabId: number

    constructor(tabId: number) {
        this.tabId = tabId
    }

    async select(): Promise<void> {
        const emptyTab = await chrome.tabs.create({ url: 'about:blank' }); // Workaround for Arc Browser where first space is empty and extension is in another space
        await chrome.tabs.update(this.tabId, { active: true })
        await chrome.tabs.remove(emptyTab.id)
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
            traceError(Component.ChromeTabManager, 'get exception:', e)
            return undefined
        }
    }
}

export default ChromeTabManager