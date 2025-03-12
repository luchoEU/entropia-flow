const ON_NOTIFICATION_CLICKED = '[notification] clicked'

const onNotificationClicked = (notificationId: string) => ({
    type: ON_NOTIFICATION_CLICKED,
    payload: {
        notificationId
    }
})

export {
    ON_NOTIFICATION_CLICKED,
    onNotificationClicked,
}
