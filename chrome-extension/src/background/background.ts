import ChromeActionManager from "../chrome/chromeActionManager"
import ChromeNotificationManager from '../chrome/chromeNotificationManager'
import ChromeAlarmManager from "../chrome/chromeAlarmManager"
import ChromeMessagesHub from "../chrome/chromeMessages"
import IMessagesHub from "../chrome/IMessagesHub"
import PortManager from "../chrome/portManager"
import { LOCAL_STORAGE } from "../chrome/chromeStorageArea"
import ChromeTabManager from "../chrome/chromeTab"
import ITabManager from "../chrome/ITab"
import { AJAX_ALARM_NAME, DEAD_ALARM_NAME, FROZEN_ALARM_NAME, SLEEP_ALARM_NAME, TICK_ALARM_NAME } from "../common/const"
import { traceId, traceOff } from "../common/trace"
import { isUnfreezeTabEnabled } from "./settings/featureSettings"
import WebSocketClient from "./client/webSocketClient"
import TabStorage from "./tabStorage"
import ApiStorage from "../view/services/api/storage"
import wiring from "./wiring"
import { getLogoUrl } from "../stream/backgroundGetLogo"

class BackgroundInitializer {
    public static async init() {
        traceId('B')

        // chrome
        const messages = new ChromeMessagesHub()
        const ajaxAlarm = new ChromeAlarmManager(AJAX_ALARM_NAME)
        const frozenAlarm = new ChromeAlarmManager(FROZEN_ALARM_NAME)
        const sleepAlarm = new ChromeAlarmManager(SLEEP_ALARM_NAME)
        const deadAlarm = new ChromeAlarmManager(DEAD_ALARM_NAME)
        const tickAlarm = new ChromeAlarmManager(TICK_ALARM_NAME)
        const tabs = new ChromeTabManager()
        const actions = new ChromeActionManager()
        const notifications = new ChromeNotificationManager()

        // ports
        const webSocketClient = new WebSocketClient()
        const portManagerFactory = (storage: TabStorage, messages: IMessagesHub, tabs: ITabManager, portName: string) =>
            new PortManager(storage, messages, tabs, portName)

        // wiring
        await wiring(messages, notifications, ajaxAlarm, frozenAlarm, sleepAlarm, deadAlarm, tickAlarm, tabs, actions, webSocketClient,
            portManagerFactory, LOCAL_STORAGE, LOCAL_STORAGE, LOCAL_STORAGE, LOCAL_STORAGE, ApiStorage, isUnfreezeTabEnabled, getLogoUrl, true)

        async function test() {
            traceOff()
        }
    }
}

BackgroundInitializer.init()
