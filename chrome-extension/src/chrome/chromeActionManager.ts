/// <reference types="chrome"/>

import IActionManager from "./IActionManager"

// Click on action
class ChromeActionManager implements IActionManager {
    public clickListen(listener: (tab: chrome.tabs.Tab) => void) {
        chrome.action.onClicked.addListener(listener)
    }
}


export default ChromeActionManager