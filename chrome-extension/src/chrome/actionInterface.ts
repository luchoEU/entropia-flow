interface IActionManager {
    clickListen(listener: (tab: chrome.tabs.Tab) => void): void
}

export default IActionManager