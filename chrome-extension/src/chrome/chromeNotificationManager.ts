class ChromeNotificationManager implements INotificationManager {
    public onClick: (notificationId: string) => Promise<void>

    constructor() {
        chrome.notifications.onClicked.addListener((notificationId) => {
            this.onClick?.(notificationId);
        });
    }
}

export default ChromeNotificationManager
