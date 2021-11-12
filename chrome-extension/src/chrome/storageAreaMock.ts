import IStorageArea from "./storageAreaInterface";

class MockStorageArea implements IStorageArea {
    getMock = jest.fn()
    async get(name: string): Promise<any> {
        return this.getMock(name)
    }

    setMock = jest.fn()
    async set(name: string, value: any): Promise<void> {
        this.setMock(name, value)
    }

    removeMock = jest.fn()
    async remove(name: string): Promise<void> {
        this.removeMock(name)
    }

    clearMock = jest.fn()
    async clear(): Promise<void> {
        this.clearMock()
    }
}

export default MockStorageArea