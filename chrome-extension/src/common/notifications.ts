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
    if (items.length == 0) return;
    const str = (item: { title: string, message: string }) => `- ${item.title}\n   ${item.message}`;
    const message = items.length === 1 ? str(items[0]) :
        `Expand or hover for details\n${items.map(str).join('\n')}`
    _create(notificationId, { title, message })
}

export { createBasicNotification, createListNotification }
