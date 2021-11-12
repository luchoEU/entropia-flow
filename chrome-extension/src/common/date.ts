import { Inventory } from "./state";

function matchDate(inv: Inventory, date: number): boolean {
    // date in the range of the inventory
    if (date) {
        if (inv.meta.lastDate === undefined) {
            if (date === inv.meta.date)
                return true
        } else {
            if (date >= inv.meta.date && date <= inv.meta.lastDate)
                return true
        }
    }
    return false
}

export {
    matchDate
}