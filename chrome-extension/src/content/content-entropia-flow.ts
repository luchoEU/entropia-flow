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
    MSG_NAME_REFRESH_SET_SLEEP_MODE,
    MSG_NAME_REMAINING_SECONDS,
    CLASS_ERROR} from '../common/const'
import { ChromeMessagesClient } from '../chrome/chromeMessages'
import { ItemsReader } from './itemsReader'
import ContentUI from './contentUi'
import { ContentTimer } from './contentTimer'
import { Inventory, makeLogInventory } from '../common/state'
import { PortHandlers } from '../chrome/IPort'
import { BalanceReader } from './balanceReader'

// Main function that runs in Entropia Universe website

//// INITIALIZATION ////

class ContentManager {
    private itemReader!: ItemsReader
    private balanceReader!: BalanceReader
    private contentUI!: ContentUI
    private timer!: ContentTimer
    private handlersMap!: PortHandlers
    private allMessagesClients: ChromeMessagesClient[] = []
    private isInitialized = false

    private static instance: ContentManager

    static getInstance(): ContentManager {
        if (!ContentManager.instance) {
            ContentManager.instance = new ContentManager()
        }
        return ContentManager.instance
    }

    showView(): boolean {
        this.allMessagesClients.forEach(client => client.send(MSG_NAME_OPEN_VIEW))
        return true
    }

    toggleIsMonitoring(): boolean {
        this.allMessagesClients.forEach(client => {
            if (this.timer.isMonitoring)
                client.send(MSG_NAME_REQUEST_TIMER_OFF)
            else
                client.send(MSG_NAME_REQUEST_TIMER_ON)
        })
        return true
    }

    async requestItems(fromHtml: boolean): Promise<Inventory> {
        const inventory = fromHtml ? await this.itemReader.requestItemsHtml() : await this.itemReader.requestItemsAjax();
        if (inventory.log)
            return inventory

        const balance = fromHtml ? await this.balanceReader.requestBalanceHtml() : await this.balanceReader.requestBalanceAjax();
        if (balance.errorText)
            return makeLogInventory(CLASS_ERROR, `Balance error: ${balance.errorText}`)

        inventory.itemlist?.push({
            id: "0",
            n: "PED Card",
            q: "1",
            v: balance.accountBalance?.toString() || "0",
            c: "CARRIED"
        });
        return inventory
    }

    broadcastLoading(loading: boolean): void {
        this.allMessagesClients.forEach(client => client.send(MSG_NAME_LOADING, { loading }))
    }

    broadcastInventory(inventory: Inventory): void {
        this.allMessagesClients.forEach(client => client.send(MSG_NAME_NEW_INVENTORY, { inventory }))
    }

    init() {
        // Initialize shared resources only once
        if (!this.isInitialized) {
            this.itemReader = new ItemsReader()
            this.balanceReader = new BalanceReader()
            this.contentUI = new ContentUI(
                () => this.showView(),
                () => this.toggleIsMonitoring()
            )
            this.timer = new ContentTimer(
                (fromHtml) => this.requestItems(fromHtml),
                this.contentUI.refreshItemsLoadTime,
                (loading) => this.broadcastLoading(loading),
                (inventory) => this.broadcastInventory(inventory)
            )
            this.handlersMap = {
                [MSG_NAME_REFRESH_WAKE_UP]: async () => {
                    await this.timer.wakeUp()
                },
                [MSG_NAME_REFRESH_ITEMS_AJAX]: async (m) => {
                    const inventory = await this.timer.trigger(m.forced, false, 'ajax', AFTER_MANUAL_WAIT_SECONDS, m.tag);
                    return { name: MSG_NAME_NEW_INVENTORY, inventory }
                },
                [MSG_NAME_REFRESH_CONTENT]: async (m) => {
                    this.timer.isMonitoring = m.isMonitoring
                    this.contentUI.refreshButton(m.isMonitoring)
                },
                [MSG_NAME_REFRESH_SET_SLEEP_MODE]: async (m) => {
                    this.timer.sleepMode = m.sleepMode
                    return { name: MSG_NAME_REMAINING_SECONDS, remainingSeconds: this.timer.remainingSeconds() }
                }
            }
            this.isInitialized = true
        }

        // Create new ChromeMessagesClient for this extension
        const messagesClient = new ChromeMessagesClient(
            MSG_NAME_REGISTER_CONTENT,
            PORT_NAME_BACK_CONTENT, this.handlersMap
        )

        // Register this client
        this.allMessagesClients.push(messagesClient)
    }
}

ContentManager.getInstance().init()
