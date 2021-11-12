// Mind Essence Log Detector

import { LME_SOLD, ME_SOLD, ViewItemData } from "../state/history";

function addMindEssenceLogAction(diff: Array<ViewItemData>) {
    for (let inv of diff) {
        let q = Number(inv.q)
        if (inv.n === 'Mind Essence'
            && inv.c === 'AUCTION'
            && inv.q[0] === '-') {
            inv.a = { type: ME_SOLD, q }

        } else if (inv.n === 'Light Mind Essence'
            && inv.c === 'AUCTION'
            && inv.q[0] === '-') {
            inv.a = { type: LME_SOLD, q }
        }
    }
}

export {
    addMindEssenceLogAction
}