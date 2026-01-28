import { CLASS_ERROR, FIRST_HTML_CHECK_WAIT_SECONDS, NORMAL_WAIT_SECONDS, SLEEP_WAIT_SECONDS, STRING_WAIT_3_MINUTES } from "../common/const";
import { Inventory, makeLogInventory } from "../common/state";
import { Component, trace, traceEnd, traceStart } from "../common/trace";

interface ContentTimerOptions {
    isMonitoring: boolean;
    firstRequest: boolean;
    normalWaitSeconds: number;
    currentWaitSeconds: number;
    sleepMode: boolean;
    itemsLoadedTime: number;
    itemsLoadingTime?: number;
}

class ContentTimer {
    private options: ContentTimerOptions;
    private requestItems: (fromHtml: boolean) => Promise<Inventory>
    private sendLoading: (loading: boolean) => void

    constructor(
        requestItems: (fromHtml: boolean) => Promise<Inventory>,
        refreshItemsLoadTime: (options: ContentTimerOptions) => void,
        sendLoading: (loading: boolean) => void,
        sendInventory: (inventory: Inventory) => void)
    {
        this.requestItems = requestItems
        this.sendLoading = sendLoading
        this.options = {
            isMonitoring: false,
            firstRequest: true,
            normalWaitSeconds: FIRST_HTML_CHECK_WAIT_SECONDS,
            currentWaitSeconds: FIRST_HTML_CHECK_WAIT_SECONDS,
            sleepMode: false,
            itemsLoadedTime: new Date().getTime()
        }
        const checkUpdateItemsLoadTime = async () => {
            if (!this.options.itemsLoadingTime && (this.options.isMonitoring || this.options.firstRequest)) {
                const inventory = await this.trigger(false, this.options.firstRequest, 'auto', NORMAL_WAIT_SECONDS)
                if (inventory.log?.class !== CLASS_ERROR) {
                    sendInventory(inventory);
                    setTimeout(checkUpdateItemsLoadTime, inventory.waitSeconds! * 1000);
                }
            }
        }
        const updateItemsLoadTime = () => {
            refreshItemsLoadTime(this.options);
            setTimeout(updateItemsLoadTime, 1000);
            checkUpdateItemsLoadTime();
        };
        updateItemsLoadTime();
    }

    public get isMonitoring(): boolean { return this.options.isMonitoring; }
    public set isMonitoring(isMonitoring: boolean) { this.options.isMonitoring = isMonitoring; }

    public get sleepMode(): boolean { return this.options.sleepMode; }
    public set sleepMode(sleepMode: boolean) {
        this.options.sleepMode = sleepMode;
        this.options.currentWaitSeconds = sleepMode ? SLEEP_WAIT_SECONDS : this.options.normalWaitSeconds;
    }

    public remainingSeconds(): number {
        const now = new Date().getTime()
        const time = now - this.options.itemsLoadedTime;
        const seconds = time / 1000;
        return Math.ceil(this.options.currentWaitSeconds - seconds)
    }

    private _getAvatarName(): string | undefined {
        let btnList = document.getElementsByTagName('button')
        for (let i = 0; i < btnList.length; i++) {
            if (btnList[i].innerHTML.trim() == 'Log Out') {
                const loginButton = btnList[i]
                const prev = loginButton.parentElement?.previousSibling as HTMLElement
                return prev?.innerText.replace('Avatar:', '').trim()
            }
        }
        return undefined
    }

    public async wakeUp() {
        trace(Component.RefreshItem, 'wakeUp received');
    }

    public async trigger(forced: boolean, fromHtml: boolean, source: string, waitSeconds: number, tag?: any): Promise<Inventory> {
        if (!forced) {
            if (source === 'ajax') {
                this.options.currentWaitSeconds = NORMAL_WAIT_SECONDS;
            }
            const remainingSeconds = this.remainingSeconds();
            if (remainingSeconds > 0) {
                return {
                    ...makeLogInventory(CLASS_ERROR, STRING_WAIT_3_MINUTES),
                    waitSeconds: remainingSeconds
                }
            }
        }

        this.options.itemsLoadingTime = new Date().getTime();
        this.sendLoading(true)
        traceStart(Component.RefreshItem, `request start {source: ${source}, fromHtml: ${fromHtml}}`)
        const inventory = await this.requestItems(fromHtml);
        inventory.avatarName = this._getAvatarName()
        inventory.waitSeconds ??= waitSeconds;
        inventory.tag = tag;
        traceEnd(Component.RefreshItem, `request end {inventory items: ${inventory.itemlist?.length ?? 'error'}}`)
        this.sendLoading(false)

        if (inventory.log?.class !== CLASS_ERROR)
            this.options.firstRequest = false;
        this.options.normalWaitSeconds = inventory.waitSeconds;
        this.options.itemsLoadedTime = new Date().getTime();
        this.options.itemsLoadingTime = undefined;

        if (this.options.sleepMode)
            inventory.waitSeconds = SLEEP_WAIT_SECONDS;
        this.options.currentWaitSeconds = inventory.waitSeconds;
        return inventory
    }
}

export {
    ContentTimer, ContentTimerOptions
}
