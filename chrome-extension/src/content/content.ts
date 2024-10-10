import {
    MSG_NAME_REGISTER_CONTENT,
    PORT_NAME_BACK_CONTENT,
    MSG_NAME_REFRESH_ITEMS_AJAX,
    MSG_NAME_REFRESH_ITEMS_HTML,
    MSG_NAME_NEW_INVENTORY,
    MSG_NAME_REFRESH_CONTENT,
    MSG_NAME_OPEN_VIEW,
    MSG_NAME_REQUEST_TIMER_OFF,
    MSG_NAME_REQUEST_TIMER_ON
} from '../common/const'
import { traceEnd, traceId, traceStart } from '../common/trace'
import { ChromeMessagesClient } from '../chrome/chromeMessages'
import { ItemsReader } from './itemsReader'
import ContentUI from './contentUi'

// Main function that runs in Entropia Universe website

//// INITIALIZATION ////

class ContentInitializer {
    private static itemsLoadedTime: number;
    private static itemsLoadingTime?: number;

    public static init() {
        traceId('C')

        let messagesClient: ChromeMessagesClient
        function showView(): boolean {
            return messagesClient.send(MSG_NAME_OPEN_VIEW)
        }
        function setIsMonitoring(isMonitoring: boolean): boolean {
            if (isMonitoring)
                return messagesClient.send(MSG_NAME_REQUEST_TIMER_ON)
            else
                return messagesClient.send(MSG_NAME_REQUEST_TIMER_OFF)
        }

        const itemReader = new ItemsReader()
        const contentUI = new ContentUI(showView, setIsMonitoring)

        messagesClient = new ChromeMessagesClient(
            MSG_NAME_REGISTER_CONTENT,
            PORT_NAME_BACK_CONTENT, {
            [MSG_NAME_REFRESH_ITEMS_AJAX]: async (m) => {
                ContentInitializer.itemsLoadingTime = new Date().getTime();
                traceStart('Refresh item received')
                const inventory = await itemReader.requestItemsAjax(m.waitSeconds)
                inventory.tag = m.tag
                traceEnd('Refresh item completed')
                ContentInitializer.itemsLoadedTime = new Date().getTime();
                ContentInitializer.itemsLoadingTime = undefined;
                return { name: MSG_NAME_NEW_INVENTORY, inventory }
            },
            [MSG_NAME_REFRESH_ITEMS_HTML]: async (m) => {
                const inventory = await itemReader.requestItemsHtml()
                return { name: MSG_NAME_NEW_INVENTORY, inventory }
            },
            [MSG_NAME_REFRESH_CONTENT]: async (m) => {
                contentUI.isMonitoring = m.isMonitoring
                contentUI.refreshButton()
            }
        })

        ContentInitializer.itemsLoadedTime = new Date().getTime();
        const updateItemsLoadTime = () => {
            contentUI.refreshItemsLoadTime(ContentInitializer.itemsLoadedTime, ContentInitializer.itemsLoadingTime);
            setTimeout(updateItemsLoadTime, 1000);
        };
        updateItemsLoadTime();
    }
}

ContentInitializer.init()
