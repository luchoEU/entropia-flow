interface IStorageArea {
    get(name: string): Promise<any>
    set(name: string, value: any): Promise<void>
    remove(name: string): Promise<void>
    clear(): Promise<void>
}

export default IStorageArea