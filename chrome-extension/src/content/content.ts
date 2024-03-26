import {
    MSG_NAME_REGISTER_CONTENT,
    PORT_NAME_BACK_CONTENT,
    MSG_NAME_REFRESH_ITEMS_AJAX,
    MSG_NAME_REFRESH_ITEMS_HTML,
    MSG_NAME_NEW_INVENTORY_NOT_READY,
    MSG_NAME_NEW_INVENTORY,
    MSG_NAME_REFRESH_CONTENT,
    MSG_NAME_OPEN_VIEW,
    MSG_NAME_REQUEST_TIMER_OFF,
    MSG_NAME_REQUEST_TIMER_ON
} from '../common/const'
import { traceEnd, traceId, traceStart } from '../common/trace'
import { ChromeMessagesClient } from '../chrome/messagesChrome'
import { EntropiaServerManager } from './entropiaServer'
import ContentUi from './contentUI'


//// INITIALIZATION ////

class ContentInitializer {
    public static init() {
        traceId('C')

        let messagesClient: ChromeMessagesClient
        function showView() {
            messagesClient.send(MSG_NAME_OPEN_VIEW)
        }
        function setIsMonitoring(isMonitoring: boolean) {
            if (isMonitoring)
                messagesClient.send(MSG_NAME_REQUEST_TIMER_ON)
            else
                messagesClient.send(MSG_NAME_REQUEST_TIMER_OFF)
        }

        const serverManager = new EntropiaServerManager()
        const contentUi = new ContentUi(showView, setIsMonitoring)

        messagesClient = new ChromeMessagesClient(
            MSG_NAME_REGISTER_CONTENT,
            PORT_NAME_BACK_CONTENT, {
            [MSG_NAME_REFRESH_ITEMS_AJAX]: async (m) => {
                traceStart('Refresh item received')
                const inventory = await serverManager.requestItemsAjax(m.waitSeconds)
                inventory.tag = m.tag
                traceEnd('Refresh item completed')
                return { name: MSG_NAME_NEW_INVENTORY, inventory }
            },
            [MSG_NAME_REFRESH_ITEMS_HTML]: async (m) => {
                const inventory = await serverManager.requestItemsHtml()
                if (inventory)
                    return { name: MSG_NAME_NEW_INVENTORY, inventory }
                else
                    return { name: MSG_NAME_NEW_INVENTORY_NOT_READY }
            },
            [MSG_NAME_REFRESH_CONTENT]: async (m) => {
                contentUi.isMonitoring = m.isMonitoring
                contentUi.refresh()
            }
        })
    }
}

ContentInitializer.init()