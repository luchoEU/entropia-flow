interface INotificationManager {
    onClick: (notificationId: string) => Promise<void>
}
