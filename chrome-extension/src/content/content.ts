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
import { ChromeMessagesClient } from '../chrome/messagesChrome'
import { ItemsReader } from './itemsReader'
import ContentUi from './contentUI'

// Main function that runs in Entropia Universe website

//// INITIALIZATION ////

class ContentInitializer {
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
        const contentUi = new ContentUi(showView, setIsMonitoring)

        messagesClient = new ChromeMessagesClient(
            MSG_NAME_REGISTER_CONTENT,
            PORT_NAME_BACK_CONTENT, {
            [MSG_NAME_REFRESH_ITEMS_AJAX]: async (m) => {
                traceStart('Refresh item received')
                const inventory = await itemReader.requestItemsAjax(m.waitSeconds)
                inventory.tag = m.tag
                traceEnd('Refresh item completed')
                return { name: MSG_NAME_NEW_INVENTORY, inventory }
            },
            [MSG_NAME_REFRESH_ITEMS_HTML]: async (m) => {
                const inventory = await itemReader.requestItemsHtml()
                return { name: MSG_NAME_NEW_INVENTORY, inventory }
            },
            [MSG_NAME_REFRESH_CONTENT]: async (m) => {
                contentUi.isMonitoring = m.isMonitoring
                contentUi.refresh()
            }
        })
    }
}

ContentInitializer.init()
