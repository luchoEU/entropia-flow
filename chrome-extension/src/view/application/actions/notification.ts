const ON_NOTIFICATION_CLICKED = '[notification] clicked'

const onNotificationClicked = (notificationId: string, buttonIndex?: number) => ({
    type: ON_NOTIFICATION_CLICKED,
    payload: {
        notificationId,
        buttonIndex
    }
})

export {
    ON_NOTIFICATION_CLICKED,
    onNotificationClicked,
}
