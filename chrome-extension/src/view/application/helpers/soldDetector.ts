// Auction Sold Detector

import { craftBlueprintUrl } from "../actions/navigation";
import { ViewItemAction, ViewItemData } from "../state/history";
import { InventoryState } from "../state/inventory";
import { TabId } from "../state/navigation";
import { bpNameFromItemName } from "./craft";
import { REFINED_LME, REFINED_ME, REFINED_NB } from "./items";

function getItemAction(item: ViewItemData, inventory: InventoryState): ViewItemAction {
    if (item.c === 'AUCTION' && item.q[0] === '-' && inventory.availableCriteria.name.includes(item.n)) {
        let navigateTo: string = undefined
        switch (item.n) {
            case REFINED_ME:
            case REFINED_LME:
            case REFINED_NB:
                navigateTo = TabId.REFINED // open to sell more
                break
            default:
                const addBpName = bpNameFromItemName(inventory, item.n)
                if (addBpName)
                    navigateTo = craftBlueprintUrl(addBpName) // open blueprint to craft more
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
