import { SetStage } from '../../../application/state/actives'
import { newDayInventory } from './sheetsInventory'
import { diluted, lme, LME_COLUMN, me, ME_COLUMN, nexus, order, sell, sold, sweat, _refineLME, _refineME } from './sheetsMeLog'
import { getSpreadsheet } from './sheetsUtils'

async function sellME(amount: string, fee: string, value: string, setStage: SetStage): Promise<number> {
    const doc = await getSpreadsheet(setStage)
    return sell(doc, amount, fee, value, ME_COLUMN, 'Auction', setStage)
}

async function sellLME(amount: string, fee: string, value: string, setStage: SetStage): Promise<number> {
    const doc = await getSpreadsheet(setStage)
    return sell(doc, amount, fee, value, LME_COLUMN, 'AuctionL', setStage)
}

async function meSold(row: number, amount: string, fee: string, value: string, setStage: SetStage) {
    const doc = await getSpreadsheet(setStage)
    return sold(doc, amount, fee, value, row, ME_COLUMN, setStage)
}

async function lmeSold(row: number, amount: string, fee: string, value: string, setStage: SetStage) {
    const doc = await getSpreadsheet(setStage)
    return sold(doc, amount, fee, value, row, LME_COLUMN, setStage)
}

async function orderNexus(markup: string, value: string, setStage: SetStage): Promise<number> {
    const doc = await getSpreadsheet(setStage)
    return order(doc, markup, value, setStage)
}

async function buySweat(price: string, amount: string, setStage: SetStage): Promise<number> {
    const doc = await getSpreadsheet(setStage)
    return sweat(doc, price, amount, setStage)
}

async function buyNexus(ttValue: string, markup: string, setStage: SetStage): Promise<number> {
    const doc = await getSpreadsheet(setStage)
    return nexus(doc, ttValue, markup, setStage)
}

async function buyME(ttValue: string, markup: string, setStage: SetStage): Promise<number> {
    const doc = await getSpreadsheet(setStage)
    return me(doc, ttValue, markup, setStage)
}

async function buyLME(ttValue: string, markup: string, setStage: SetStage): Promise<number> {
    const doc = await getSpreadsheet(setStage)
    return lme(doc, ttValue, markup, setStage)
}

async function buyDiluted(ttValue: string, markup: string, setStage: SetStage): Promise<number> {
    const doc = await getSpreadsheet(setStage)
    return diluted(doc, ttValue, markup, setStage)
}

async function refineME(amount: string, setStage: SetStage): Promise<number> {
    const doc = await getSpreadsheet(setStage)
    return _refineME(doc, amount, setStage)
}

async function refineLME(amount: string, setStage: SetStage): Promise<number> {
    const doc = await getSpreadsheet(setStage)
    return _refineLME(doc, amount, setStage)
}

async function newDay(setStage: SetStage) {
    const doc = await getSpreadsheet(setStage)
    newDayInventory(doc, setStage)
}

export default {
    sellME,
    sellLME,
    meSold,
    lmeSold,
    orderNexus,
    buySweat,
    buyNexus,
    buyME,
    buyLME,
    buyDiluted,
    refineME,
    refineLME,
    newDay,
}