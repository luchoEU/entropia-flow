interface ITab {
    select(): Promise<void>
}

interface ITabManager {
    create(url: string): Promise<ITab>
    get(tabId: number): Promise<ITab>
}

export default ITabManager
export {
    ITab
}