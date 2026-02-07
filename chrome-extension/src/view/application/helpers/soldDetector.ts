// Auction Sold Detector

import { ViewItemAction, ViewItemData } from "../state/history";
import { AvailableCriteria, ItemOwned } from "../state/inventory";
import { TabId } from "../state/navigation";
import { formatToUrl } from "./navigation";
import { bpNameFromItemName } from "./craft-utils";
import { REFINED_LME, REFINED_ME, REFINED_NB } from "./items";

function getItemAction(item: ViewItemData, availableCriteria: AvailableCriteria, ownedItems: ItemOwned[]): ViewItemAction {
    if (item.c === 'AUCTION' && item.q[0] === '-' && availableCriteria.name.includes(item.n)) {
        let navigateTo: string = undefined
        switch (item.n) {
            case REFINED_ME:
            case REFINED_LME:
            case REFINED_NB:
                navigateTo = TabId.REFINED // open to sell more
                break
            default:
                const addBpName = bpNameFromItemName(ownedItems, item.n)
                if (addBpName)
                    navigateTo = `${TabId.CRAFT}/${formatToUrl(addBpName)}` // open blueprint to craft more
                break
        }
        return {
            message: `${item.n} sold to auction`, // used for send notification check
            navigateTo
        }
    }
    return undefined
}

export {
    getItemAction
}
