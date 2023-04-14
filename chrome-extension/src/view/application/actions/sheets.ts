import { MATERIAL_SW, materialMap } from "../helpers/materials"
import { ActivesItem } from "../state/actives"
import { CalculatorStateOut1 } from "../state/calculator"
import { OPERATION_TYPE_AUCTION, OPERATION_TYPE_BUY_PER_K, OPERATION_TYPE_BUY_STACKABLE, OPERATION_TYPE_ORDER, OPERATION_TYPE_REFINE, OPERATION_TYPE_REFINED_BUY_MATERIAL, OPERATION_TYPE_REFINED_ORDER_MATERIAL, OPERATION_TYPE_REFINED_REFINE_MATERIAL, OPERATION_TYPE_REFINED_USE_MATERIAL, OPERATION_TYPE_SOLD_ACTIVE, OPERATION_TYPE_USE } from "../state/sheets"

const ADD_PENDING_CHANGE = "[sheets] add pending change"
const CLEAR_PENDING_CHANGES = "[sheets] clear pending changes"
const SET_TIMEOUT_ID = "[sheets] set timeout id"
const PERFORM_CHANGE = "[sheets] perform change"
const DONE_PENDING_CHANGES = "[sheets] done pending changes"

const setTimeoutId = (timeoutId: NodeJS.Timeout) => ({
    type: SET_TIMEOUT_ID,
    payload: {
        timeoutId
    }
})

const performChange = {
    type: PERFORM_CHANGE
}

const clearPendingChanges = {
    type: CLEAR_PENDING_CHANGES
}

const donePendingChanges = {
    type: DONE_PENDING_CHANGES
}

const addUseToSheet = (material: string, amount: string, cost: string) => ({
    type: ADD_PENDING_CHANGE,
    payload: {
        operationType: OPERATION_TYPE_USE,
        material,
        parameters: [ amount, cost ]
    }
})

const addBuyPerKToSheet = (material: string, price: string, amount: string) => ({
    type: ADD_PENDING_CHANGE,
    payload: {
        operationType: OPERATION_TYPE_BUY_PER_K,
        material,
        parameters: [ price, amount ]
    }
})

const addStackableToSheet = (material: string, ttValue: string, markup: string) => ({
    type: ADD_PENDING_CHANGE,
    payload: {
        operationType: OPERATION_TYPE_BUY_STACKABLE,
        material,
        parameters: [ ttValue, markup ]
    }
})

const addRefineToSheet = (material: string, amount: string) => ({
    type: ADD_PENDING_CHANGE,
    payload: {
        operationType: OPERATION_TYPE_REFINE,
        material,
        parameters: [ amount ]
    }
})

const addOrderToSheet = (material: string, markup: string, value: string) => ({
    type: ADD_PENDING_CHANGE,
    payload: {
        operationType: OPERATION_TYPE_ORDER,
        material,
        parameters: [ markup, value ]
    }
})

const auctionTitle = (material: string): string => `Auction ${materialMap[material].toUpperCase()}`

const addAuctionToSheet = (material: string, s: CalculatorStateOut1) => ({
    type: ADD_PENDING_CHANGE,
    payload: {
        operationType: OPERATION_TYPE_AUCTION,
        material,
        parameters: [ s.amount, s.openingFee, s.openingValue ],
        doneParameters: [ auctionTitle(material), s.amount, s.openingValue, s.buyoutValue, s.buyoutFee ]
    }
})

const soldActiveToSheet = (item: ActivesItem) => ({
    type: ADD_PENDING_CHANGE,
    payload: {
        operationType: OPERATION_TYPE_SOLD_ACTIVE,
        date: item.date,
        parameters: [ item.row, item.quantity, item.buyoutFee, item.buyout ],
        doneParameters: [ item.date ]
    }
})

const refinedBuyMaterial = (material: string, amount: string, markup: string) => ({
    type: ADD_PENDING_CHANGE,
    payload: {
        operationType: OPERATION_TYPE_REFINED_BUY_MATERIAL,
        material,
        parameters: [ amount, markup ]
    }
})

const refinedOrderMaterial = (material: string, ttValue: string, markup: string) => ({
    type: ADD_PENDING_CHANGE,
    payload: {
        operationType: OPERATION_TYPE_REFINED_ORDER_MATERIAL,
        material,
        parameters: [ ttValue, markup ]
    }
})

const refinedUseMaterial = (material: string, amount: string) => ({
    type: ADD_PENDING_CHANGE,
    payload: {
        operationType: OPERATION_TYPE_REFINED_USE_MATERIAL,
        material,
        paremeters: [ amount ]
    }
})

const refinedRefineMaterial = (material: string, amount: string) => ({
    type: ADD_PENDING_CHANGE,
    payload: {
        operationType: OPERATION_TYPE_REFINED_REFINE_MATERIAL,
        parameters: [ material, amount ]
    }
})

export {
    ADD_PENDING_CHANGE,
    CLEAR_PENDING_CHANGES,
    SET_TIMEOUT_ID,
    PERFORM_CHANGE,
    DONE_PENDING_CHANGES,
    setTimeoutId,
    performChange,
    clearPendingChanges,
    donePendingChanges,
    addUseToSheet,
    addBuyPerKToSheet,
    addStackableToSheet,
    addRefineToSheet,
    addOrderToSheet,
    addAuctionToSheet,
    soldActiveToSheet,
    refinedBuyMaterial,
    refinedOrderMaterial,
    refinedUseMaterial,
    refinedRefineMaterial,
}
