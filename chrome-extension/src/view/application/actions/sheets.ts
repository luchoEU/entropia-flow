import { BudgetLineData } from "../../services/api/sheets/sheetsBudget"
import { materialMap } from "../helpers/materials"
import { ActivesItem } from "../state/actives"
import { RefinedCalculatorStateOut } from "../state/refined"
import { OPERATION_TYPE_REFINED_AUCTION_MATERIAL, OPERATION_TYPE_REFINED_BUY_MATERIAL, OPERATION_TYPE_REFINED_ORDER_MATERIAL, OPERATION_TYPE_REFINED_REFINE_MATERIAL, OPERATION_TYPE_REFINED_USE_MATERIAL, OPERATION_TYPE_REFINED_SOLD_ACTIVE } from "../state/sheets"

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

const auctionTitle = (material: string): string => `Auction ${materialMap[material].toUpperCase()}`

const refinedSoldActive = (item: ActivesItem) => {
    const line: BudgetLineData = {
        reason: 'Sold',
        ped: Number(item.buyout) - Number(item.buyoutFee) + Number(item.openingFee),
        materials: [
            {
                name: item.material,
                quantity: -Number(item.quantity)
            }
        ]
    }
    return {
        type: ADD_PENDING_CHANGE,
        payload: {
            operationType: OPERATION_TYPE_REFINED_SOLD_ACTIVE,
            material: item.material,
            date: item.date,
            parameters: [ line ],
            doneParameters: [ item.date ]
        }
    }
}

const refinedAuctionMaterial = (material: string, s: RefinedCalculatorStateOut) => {
    const line: BudgetLineData = {
        reason: 'Auction',
        ped: -Number(s.openingFee),
        materials: []
    }
    return {
        type: ADD_PENDING_CHANGE,
        payload: {
            operationType: OPERATION_TYPE_REFINED_AUCTION_MATERIAL,
            material,
            parameters: [ line ],
            doneParameters: [ auctionTitle(material), material, s.amount, s.openingValue, s.openingFee, s.buyoutValue, s.buyoutFee ]
        }
    }
}

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
    refinedSoldActive,
    refinedAuctionMaterial,
    refinedBuyMaterial,
    refinedOrderMaterial,
    refinedUseMaterial,
    refinedRefineMaterial,
}
