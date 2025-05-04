interface INotificationManager {
    onClick: (notificationId: string, buttonIndex?: number) => Promise<void>
}
