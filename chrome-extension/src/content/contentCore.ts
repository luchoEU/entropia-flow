import { ChromeMessagesClient } from "../chrome/chromeMessages"
import { AFTER_MANUAL_WAIT_SECONDS, CLASS_ERROR, MSG_NAME_LOADING, MSG_NAME_NEW_INVENTORY, MSG_NAME_OPEN_VIEW, MSG_NAME_CONTENT_SET_MONITORING, MSG_NAME_REFRESH_ITEMS_AJAX, MSG_NAME_CONTENT_SET_SLEEP_MODE, MSG_NAME_REFRESH_WAKE_UP, MSG_NAME_REGISTER_CONTENT, MSG_NAME_REMAINING_SECONDS, PORT_NAME_BACK_CONTENT, MSG_NAME_MONITORING_CHANGED } from "../common/const"
import { Inventory, makeLogInventory } from "../common/state"
import { BalanceReader } from "./balanceReader"
import { ContentTimer } from "./contentTimer"
import ContentUI from "./contentUi"
import { ItemsReader } from "./itemsReader"
import { LeaderBridge } from "./leaderBridge"

export class ContentCore {
    private itemReader!: ItemsReader
    private balanceReader!: BalanceReader
    private contentUI!: ContentUI
    private timer!: ContentTimer

    private chromeClient!: ChromeMessagesClient

    constructor(private bridge: LeaderBridge) { }

    init() {
        // Always create ChromeMessagesClient (leader or client)
        this.initChromeClient()

        // Only leader creates heavy resources
        if (this.bridge.isLeaderInstance()) {
            this.initCore()
            this.registerLeaderHandlers()
        }
    }

    // ==============================
    // Chrome ↔ Content
    // ==============================

    private initChromeClient() {
        const handlers = new Proxy({}, {
            get: () => async (m: any) => this.bridge.call(m.name, m)
        }) as any
        this.chromeClient = new ChromeMessagesClient(
            MSG_NAME_REGISTER_CONTENT,
            PORT_NAME_BACK_CONTENT,
            handlers
        )

        // Passthrough: forward all broadcasts to chromeClient
        this.bridge.registerBroadcast("*", async (m: any) => {
            const { name, ...data } = m
            this.chromeClient.send(name, data)
        })
    }

    // ==============================
    // Leader-only core
    // ==============================

    private initCore() {
        this.itemReader = new ItemsReader()
        this.balanceReader = new BalanceReader()

        this.contentUI = new ContentUI(
            () => this.showView(),
            () => this.setMonitoring(!this.timer.isMonitoring)
        )

        this.timer = new ContentTimer(
            (fromHtml) => this.requestItems(fromHtml),
            this.contentUI.refreshItemsLoadTime,
            (loading) => this.broadcastLoading(loading),
            (inventory) => this.broadcastInventory(inventory)
        )
    }

    private registerLeaderHandlers() {
        this.bridge.register(
            MSG_NAME_REFRESH_WAKE_UP,
            async () => {
                await this.timer.wakeUp()
            }
        )

        this.bridge.register(
            MSG_NAME_REFRESH_ITEMS_AJAX,
            async (m) => {
                const inventory = await this.timer.trigger(m.forced, false, "ajax", AFTER_MANUAL_WAIT_SECONDS, m.tag)
                this.bridge.broadcast(MSG_NAME_NEW_INVENTORY, { inventory })
            }
        )

        this.bridge.register(
            MSG_NAME_CONTENT_SET_MONITORING,
            async (m) => this.setMonitoring(m.isMonitoring)
        )

        // Set sleep mode
        this.bridge.register(
            MSG_NAME_CONTENT_SET_SLEEP_MODE,
            async (m) => {
                this.timer.sleepMode = m.sleepMode
                this.bridge.broadcast(MSG_NAME_REMAINING_SECONDS, {
                    remainingSeconds: this.timer.remainingSeconds()
                })
            }
        )
    }

    // ==============================
    // Internals
    // ==============================

    private showView(): boolean {
        this.chromeClient.send(MSG_NAME_OPEN_VIEW)
        return true
    }

    private setMonitoring(isMonitoring: boolean) {
        this.timer.isMonitoring = isMonitoring
        this.contentUI.refreshButton(isMonitoring)
        this.bridge.broadcast(MSG_NAME_MONITORING_CHANGED, { isMonitoring })
    }

    private async requestItems(fromHtml: boolean): Promise<Inventory> {
        const inventory = fromHtml
            ? await this.itemReader.requestItemsHtml()
            : await this.itemReader.requestItemsAjax()

        if (inventory.log) return inventory

        const balance = fromHtml
            ? await this.balanceReader.requestBalanceHtml()
            : await this.balanceReader.requestBalanceAjax()

        if (balance.errorText) {
            return makeLogInventory(CLASS_ERROR, balance.errorText)
        }

        inventory.itemlist?.push({
            id: "0",
            n: "PED Card",
            q: "1",
            v: balance.accountBalance?.toString() ?? "0",
            c: "CARRIED"
        })

        return inventory
    }

    private broadcastLoading(loading: boolean) {
        this.bridge.broadcast(MSG_NAME_LOADING, { loading })
    }

    private broadcastInventory(inventory: Inventory) {
        this.bridge.broadcast(MSG_NAME_NEW_INVENTORY, { inventory })
    }
}
