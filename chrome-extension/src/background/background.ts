import ChromeActionManager from "../chrome/chromeActionManager"
import ChromeAlarmManager from "../chrome/chromeAlarmManager"
import ChromeMessagesHub from "../chrome/chromeMessages"
import IMessagesHub from "../chrome/IMessagesHub"
import PortManager from "../chrome/portManager"
import { LOCAL_STORAGE } from "../chrome/chromeStorageArea"
import ChromeTabManager from "../chrome/chromeTab"
import ITabManager from "../chrome/ITab"
import { AJAX_ALARM_NAME, HTML_ALARM_NAME, TICK_ALARM_NAME } from "../common/const"
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
        const tickAlarm = new ChromeAlarmManager(TICK_ALARM_NAME)
        const tabs = new ChromeTabManager()
        const actions = new ChromeActionManager()

        // ports
        const webSocketClient = new WebSocketClient()
        const portManagerFactory = (storage: TabStorage, messages: IMessagesHub, tabs: ITabManager, portName: string) =>
            new PortManager(storage, messages, tabs, portName)

        // wiring
        await wiring(messages, htmlAlarm, ajaxAlarm, tickAlarm, tabs, actions, webSocketClient,
            portManagerFactory, LOCAL_STORAGE, LOCAL_STORAGE, LOCAL_STORAGE, LOCAL_STORAGE)

        async function test() {
            traceOff()
        }
    }
}

BackgroundInitializer.init()