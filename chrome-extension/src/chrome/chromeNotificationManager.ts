class ChromeNotificationManager implements INotificationManager {
    public onClick: (notificationId: string, buttonIndex?: number) => Promise<void>

    constructor() {
        chrome.notifications.onClicked.addListener((notificationId) => {
            this.onClick?.(notificationId);
        });
        chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
            this.onClick?.(notificationId, buttonIndex);
        });
    }
}

export default ChromeNotificationManager
