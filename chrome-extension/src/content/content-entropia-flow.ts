import {
    MSG_NAME_REGISTER_CONTENT,
    PORT_NAME_BACK_CONTENT,
    MSG_NAME_REFRESH_ITEMS_AJAX,
    MSG_NAME_NEW_INVENTORY,
    MSG_NAME_REFRESH_CONTENT,
    MSG_NAME_OPEN_VIEW,
    MSG_NAME_REQUEST_TIMER_OFF,
    MSG_NAME_REQUEST_TIMER_ON,
    MSG_NAME_LOADING,
    MSG_NAME_REFRESH_WAKE_UP,
    AFTER_MANUAL_WAIT_SECONDS,
    MSG_NAME_REFRESH_SET_SLEEP_MODE} from '../common/const'
import { ChromeMessagesClient } from '../chrome/chromeMessages'
import { ItemsReader } from './itemsReader'
import ContentUI from './contentUi'
import { ContentTimer } from './contentTimer'
import { Inventory } from '../common/state'
import { PortHandlers } from '../chrome/IPort'

// Main function that runs in Entropia Universe website

//// INITIALIZATION ////

class ContentInitializer {
    public static init() {
        let messagesClient: ChromeMessagesClient
        function showView(): boolean {
            return messagesClient.send(MSG_NAME_OPEN_VIEW)
        }
        function toggleIsMonitoring(): boolean {
            if (timer.isMonitoring)
                return messagesClient.send(MSG_NAME_REQUEST_TIMER_OFF)
            else
                return messagesClient.send(MSG_NAME_REQUEST_TIMER_ON)
        }
        async function requestItems(fromHtml: boolean): Promise<Inventory> {
            return fromHtml ? await itemReader.requestItemsHtml() : await itemReader.requestItemsAjax()
        }

        const itemReader = new ItemsReader()
        const contentUI = new ContentUI(showView, toggleIsMonitoring)
        const timer = new ContentTimer(requestItems,
                contentUI.refreshItemsLoadTime,
                loading => messagesClient.send(MSG_NAME_LOADING, { loading }),
                inventory => messagesClient.send(MSG_NAME_NEW_INVENTORY, { inventory }));

        const handlersMap: PortHandlers = {
            [MSG_NAME_REFRESH_WAKE_UP]: async () => {
                await timer.wakeUp()
            },
            [MSG_NAME_REFRESH_ITEMS_AJAX]: async (m) => {
                const inventory = await timer.trigger(m.forced, false, 'ajax', AFTER_MANUAL_WAIT_SECONDS, m.tag);
                return { name: MSG_NAME_NEW_INVENTORY, inventory }
            },
            [MSG_NAME_REFRESH_CONTENT]: async (m) => {
                timer.isMonitoring = m.isMonitoring
                contentUI.refreshButton(m.isMonitoring)
            },
            [MSG_NAME_REFRESH_SET_SLEEP_MODE]: async (m) => {
                timer.sleepMode = m.sleepMode
            }
        }

        messagesClient = new ChromeMessagesClient(
            MSG_NAME_REGISTER_CONTENT,
            PORT_NAME_BACK_CONTENT, handlersMap
        )
    }
}

ContentInitializer.init()
