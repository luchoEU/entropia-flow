import IStorageArea from '../chrome/IStorageArea'

class TabData {
    id: number
    title: string
}

class TabStorage {
    private area: IStorageArea
    private storageKey: string
    private list: Array<TabData>

    constructor(area: IStorageArea, storageKey: string) {
        this.area = area
        this.storageKey = storageKey
    }

    public async get(): Promise<Array<TabData>> {
        if (!this.list) {
            this.list = await this.area.get(this.storageKey)
            if (!this.list || !(this.list instanceof Array)) {
                this.list = []
            }
        }
        return this.list
    }

    private async _set(list: Array<TabData>) {
        this.list = list
        await this.area.set(this.storageKey, list)
    }

    public async add(id: number, title: string): Promise<Array<TabData>> {
        const list = await this.get()
        if (!list.some(d => d.id === id)) {
            list.push({ id, title })
            await this._set(list)
        }
        return list
    }

    public async remove(id: number): Promise<Array<TabData>> {
        let list = await this.get()
        if (list.some(d => d.id)) {
            list = list.filter(d => id !== d.id)
            await this._set(list)
        }
        return list
    }

    public async removeAll(toRemove: Array<number>): Promise<void> {
        if (toRemove.length > 0) {
            const list = await this.get()
            const newList = list.filter(d => !toRemove.includes(d.id))
            await this._set(newList)
        }
    }
}

export { TabData }
export default TabStorage