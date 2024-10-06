import ChromeActionManager from "../chrome/actionChrome"
import ChromeAlarmManager from "../chrome/alarmChrome"
import ChromeMessagesHub from "../chrome/messagesChrome"
import IMessagesHub from "../chrome/messagesInterface"
import ChromePortManager from "../chrome/portChrome"
import { LOCAL_STORAGE } from "../chrome/storageAreaChrome"
import ChromeTabManager from "../chrome/tabsChrome"
import ITabManager from "../chrome/tabsInterface"
import { AJAX_ALARM_NAME, HTML_ALARM_NAME } from "../common/const"
import { traceId, traceOff } from "../common/trace"
import WebSocketClient from "./client/webSocketClient"
import TabStorage from "./tabStorage"
import wiring from "./wiring"

class BackgroundInitializer {
    public static async init() {
        traceId('B')

        // chrome
        const messages = new ChromeMessagesHub()
        const htmlAlarm = new ChromeAlarmManager(HTML_ALARM_NAME)
        const ajaxAlarm = new ChromeAlarmManager(AJAX_ALARM_NAME)
        const tabs = new ChromeTabManager()
        const actions = new ChromeActionManager()

        // ports
        const webSocketClient = new WebSocketClient()
        const portManagerFactory = (storage: TabStorage, messages: IMessagesHub, tabs: ITabManager, portName: string) =>
            new ChromePortManager(storage, messages, tabs, portName)

        // wiring
        await wiring(messages, htmlAlarm, ajaxAlarm, tabs, actions, webSocketClient,
            portManagerFactory, LOCAL_STORAGE, LOCAL_STORAGE, LOCAL_STORAGE)

        async function test() {
            traceOff()
        }
    }
}

BackgroundInitializer.init()