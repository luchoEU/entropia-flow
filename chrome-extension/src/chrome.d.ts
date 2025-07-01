declare namespace chrome.tabs {
    interface Tab {
        // Chrome 132 (released on January 14, 2025)
        // Whether the tab is frozen. A frozen tab cannot execute tasks, including event handlers or timers.
        // It is visible in the tab strip and its content is loaded in memory. It is unfrozen on activation.
        frozen?: boolean;
    }
}
