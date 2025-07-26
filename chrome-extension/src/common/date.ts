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

// convert game log time to timestamp
function gameTime(time: string): number {
    return new Date(`${time}Z`).getTime()
}

function dateToString(time: number, showSeconds: boolean = false): string {
    const date = new Date(time)
    return date.toLocaleString('sv-SE', { // sv-SE is like ISO-format
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: showSeconds ? '2-digit' : undefined,
        hour12: false
    })
}

export {
    matchDate,
    gameTime,
    dateToString,
}
