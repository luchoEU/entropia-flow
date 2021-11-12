import IStorageArea from "../../chrome/storageAreaInterface";
import { STORAGE_ALARM } from "../../common/const";

class AlarmSettings {
    private storage: IStorageArea
    private autoRequest: boolean

    constructor(storage: IStorageArea) {
        this.storage = storage
    }

    public async turnAutoRequest(on: boolean) {
        this.autoRequest = on
        await this._save()
    }

    public async isAutoRequestOn() {
        if (this.autoRequest === undefined)
            await this._load()
        return this.autoRequest
    }

    private async _load() {
        const value = await this.storage.get(STORAGE_ALARM)
        if (value !== undefined) {
            this.autoRequest = value.autoRequest
        } else {
            this.autoRequest = true
        }
    }

    private async _save() {
        await this.storage.set(STORAGE_ALARM, { autoRequest: this.autoRequest })
    }
}

export default AlarmSettings