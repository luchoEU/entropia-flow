import IStorageArea from "./IStorageArea";

class MemoryStorageArea implements IStorageArea {
    private data = { }

    async get(name: string): Promise<any> {
        return this.data[name];
    }

    async set(name: string, value: any): Promise<void> {
        this.data[name] = value;
    }

    async remove(name: string): Promise<void> {
        delete this.data[name];
    }

    async clear(): Promise<void> {
        this.data = { };
    }
}

export default MemoryStorageArea
