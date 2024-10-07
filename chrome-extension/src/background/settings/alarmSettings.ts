import IStorageArea from "../../chrome/IStorageArea";
import { STORAGE_ALARM } from "../../common/const";

class AlarmSettings {
    private storage: IStorageArea
    private isMonitoring: boolean

    constructor(storage: IStorageArea) {
        this.storage = storage
    }

    public async turnMonitoringOn(on: boolean) {
        this.isMonitoring = on
        await this._save()
    }

    public async isMonitoringOn() {
        if (this.isMonitoring === undefined)
            await this._load()
        return this.isMonitoring
    }

    private async _load() {
        const value = await this.storage.get(STORAGE_ALARM)
        this.isMonitoring = value?.isMonitoring ?? true
    }

    private async _save() {
        await this.storage.set(STORAGE_ALARM, { isMonitoring: this.isMonitoring })
    }
}

export default AlarmSettings