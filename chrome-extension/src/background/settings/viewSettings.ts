import IStorageArea from "../../chrome/storageAreaInterface"
import { STORAGE_VIEW } from "../../common/const"

class ViewSettings {
    private storage: IStorageArea
    private last: number

    constructor(storage: IStorageArea) {
        this.storage = storage
    }

    public async setLast(date: number) {
        this.last = date
        await this._save()
    }

    public async getLast() {
        if (this.last === undefined)
            await this._load()
        return this.last
    }

    private async _load() {
        const value = await this.storage.get(STORAGE_VIEW)
        if (value !== undefined) {
            this.last = value.last
        } else {
            this.last = null
        }
    }

    private async _save() {
        await this.storage.set(STORAGE_VIEW, { last: this.last })
    }
}

export default ViewSettings