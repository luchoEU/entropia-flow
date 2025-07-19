interface INotificationManager {
    onClick: (notificationId: string, buttonIndex?: number) => Promise<void>
}

export default INotificationManager
