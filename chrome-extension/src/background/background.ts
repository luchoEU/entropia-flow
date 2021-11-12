import ChromeActionManager from "../chrome/actionChrome"
import ChromeAlarmManager from "../chrome/alarmChrome"
import ChromeMessagesHub from "../chrome/messagesChrome"
import IMessagesHub from "../chrome/messagesInterface"
import ChromePortManager from "../chrome/portChrome"
import { LOCAL_STORAGE, SYNC_STORAGE } from "../chrome/storageAreaChrome"
import ChromeTabManager from "../chrome/tabsChrome"
import ITabManager from "../chrome/tabsInterface"
import { ALARM_NAME } from "../common/const"
import { traceId, traceOff } from "../common/trace"
import ListStorage from "./listStorage"
import BackendServerManager from "./server/backendServer"
import wiring from "./wiring"

class BackgroundInitializer {
    public static async init() {
        traceId('B')

        // chrome
        const messages = new ChromeMessagesHub()
        const alarms = new ChromeAlarmManager(ALARM_NAME)
        const tabs = new ChromeTabManager()
        const actions = new ChromeActionManager()

        // server
        const server = new BackendServerManager()

        // ports
        const portManagerFactory = (storage: ListStorage, messages: IMessagesHub, tabs: ITabManager, portName: string) =>
            new ChromePortManager(storage, messages, tabs, portName)

        // wiring
        await wiring(messages, alarms, tabs, actions, server,
            portManagerFactory, LOCAL_STORAGE, LOCAL_STORAGE, LOCAL_STORAGE)

        async function test() {
            traceOff()
        }
    }
}

BackgroundInitializer.init()