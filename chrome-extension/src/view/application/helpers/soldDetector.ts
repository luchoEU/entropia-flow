// Auction Sold Detector

import { KIN_AMP_SOLD, LME_SOLD, ME_SOLD, NB_SOLD, ViewItemData } from "../state/history";

function addItemAction(diff: Array<ViewItemData>) {
    for (let inv of diff) {
        let q = Number(inv.q)
        if (inv.c === 'AUCTION' && inv.q[0] === '-') {
            if (inv.n === 'Mind Essence') {
                inv.a = { type: ME_SOLD, q }
            } else if (inv.n === 'Light Mind Essence') {
                inv.a = { type: LME_SOLD, q }
            } else if (inv.n === 'Nutrio Bar') {
                inv.a = { type: NB_SOLD, q }
            } else if (inv.n.startsWith('NeoPsion Kinetic Amplifier')) {
                inv.a = { type: KIN_AMP_SOLD, q }
            }
        }
    }
}

export {
    addItemAction
}
