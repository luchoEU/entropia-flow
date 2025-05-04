import { Component, trace, traceError } from "./trace";

function _create(notificationId: string, options: { message: string } & Partial<chrome.notifications.NotificationOptions<true>>) {
    chrome.notifications.create(
        notificationId, {
            type: "basic",
            iconUrl: "img/flow128.png",
            title: "Entropia Flow",
            isClickable: false,
            buttons: [
                { title: "Open Extension" }
            ],
            priority: 2,
            ...options
        }, (id) => {
            if (chrome.runtime.lastError) {
                traceError(Component.Notifications, `Notification error: ${chrome.runtime.lastError.message}`);
            } else {
                trace(Component.Notifications, `Notification shown with ID: ${id}, message: ${options.message}`);
            }
        }
    )
}

function createBasicNotification({ notificationId, message }: {
    notificationId?: string
    message: string
}) {
    _create(notificationId, { message })
}

function createListNotification({ notificationId, title, items }: {
    notificationId?: string
    title: string,
    items: { title: string, message: string }[]
}) {
    _create(notificationId, { title, message: `Hover for details\n${items.map(i => `- ${i.title}\n   ${i.message}`).join('\n')}` })
}

export { createBasicNotification, createListNotification }
