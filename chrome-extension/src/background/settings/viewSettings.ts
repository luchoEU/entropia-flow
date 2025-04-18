import IStorageArea from "../../chrome/IStorageArea"
import { STORAGE_VIEW } from "../../common/const"
import { Inventory } from "../../common/state"

class ViewSettings {
    private storage: IStorageArea
    private last: number
    private webSocketUrl: string

    constructor(storage: IStorageArea) {
        this.storage = storage
    }

    public async setLast(date: number): Promise<void> {
        this.last = date
        await this._save()
    }

    public async getLast(): Promise<number> {
        if (this.last === undefined)
            await this._load()
        return this.last
    }

    public async setLastIfEqual(list: Array<Inventory>): Promise<void> {
        const last = await this.getLast()
        const index = list.findIndex(i =>
            i.meta.lastDate === undefined ?
                i.meta.date === last :
                last >= i.meta.date && last <= i.meta.lastDate  )
        if (index != -1 && index < list.length - 1) {
            const newLastMeta = list[list.length - 1].meta
            if (newLastMeta.lastDate === undefined &&
                newLastMeta.total === list[index].meta.total) {
                for (let n = index + 1; n < list.length - 1; n++) {
                    if (list[n].log === undefined)
                        return
                }
                await this.setLast(newLastMeta.date)
            }
        }
    }

    public async setWebSocketUrl(url: string): Promise<void> {
        this.webSocketUrl = url
        await this._save()
    }

    public async getWebSocketUrl(): Promise<string> {
        if (this.webSocketUrl === undefined)
            await this._load()
        return this.webSocketUrl
    }

    private async _load(): Promise<void> {
        const value = await this.storage.get(STORAGE_VIEW)
        if (value !== undefined) {
            this.last = value.last
            this.webSocketUrl = value.webSocketClient
        } else {
            this.last = null
            this.webSocketUrl = null
        }
    }

    private async _save(): Promise<void> {
        await this.storage.set(STORAGE_VIEW, { last: this.last })
    }
}

export default ViewSettings