import IStorageArea from '../chrome/storageAreaInterface'

class ListStorage {
    private area: IStorageArea
    private storageKey: string
    private list: Array<number>

    constructor(area: IStorageArea, storageKey: string) {
        this.area = area
        this.storageKey = storageKey
    }

    public async get(): Promise<Array<number>> {
        if (!this.list) {
            this.list = await this.area.get(this.storageKey)
            if (!this.list || !(this.list instanceof Array)) {
                this.list = []
            }
        }
        return this.list
    }

    private async _set(list: Array<number>) {
        this.list = list
        await this.area.set(this.storageKey, list)
    }

    public async add(id: number): Promise<Array<number>> {
        const list = await this.get()
        if (!list.includes(id)) {
            list.push(id)
            await this._set(list)
        }
        return list
    }

    public async remove(id: number): Promise<Array<number>> {
        let list = await this.get()
        if (list.includes(id)) {
            list = list.filter(n => n !== id)
            await this._set(list)
        }
        return list
    }

    public async removeAll(toRemove: Array<number>): Promise<void> {
        if (toRemove.length > 0) {
            const list = await this.get()
            const newList = list.filter(id => !toRemove.includes(id))
            await this._set(newList)
        }
    }
}

export default ListStorage