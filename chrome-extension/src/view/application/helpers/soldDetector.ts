// Auction Sold Detector

import { CRAFT_PAGE, REFINED_PAGE } from "../actions/menu";
import { ViewItemAction, ViewItemData } from "../state/history";
import { AvailableCriteria } from "../state/inventory";
import { REFINED_LME, REFINED_ME, REFINED_NB } from "./items";

function getItemAction(inv: ViewItemData, availableCriteria: AvailableCriteria): ViewItemAction {
    let q = Number(inv.q)
    if (inv.c === 'AUCTION' && inv.q[0] === '-' && availableCriteria.name.includes(inv.n)) {
        let menu = undefined
        switch (inv.n) {
            case REFINED_ME:
            case REFINED_LME:
            case REFINED_NB:
                menu = REFINED_PAGE
                break
            default:
                menu = CRAFT_PAGE
                break
        }
        return {
            message: `${inv.n} sold to auction`,
            menu
        }
    }
}

export {
    getItemAction
}
