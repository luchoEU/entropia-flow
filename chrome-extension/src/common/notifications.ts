/// <reference types="chrome"/>
import { Component, trace, traceError } from "./trace";
import { isNotificationEnabled } from "../background/settings/featureSettings";

async function _create(notificationId: string, options: { message: string } & Partial<chrome.notifications.NotificationOptions<true>>) {
    if (!await isNotificationEnabled())
        return;

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

async function createBasicNotification(notificationId: string, message: string) {
    await _create(notificationId, { message })
}

async function createListNotification(notificationId: string, title: string, items: { title: string, message: string }[]) {
    if (items.length == 0) return;
    const str = (item: { title: string, message: string }) => `- ${item.title}\n   ${item.message}`;
    const message = items.length === 1 ? str(items[0]) :
        `Expand or hover for details\n${items.map(str).join('\n')}`
    await _create(notificationId, { title, message })
}

export { createBasicNotification, createListNotification }
