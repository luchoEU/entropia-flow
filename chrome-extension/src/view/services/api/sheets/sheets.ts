import { SetStage } from '../../../application/state/actives'
import { newDayInventory } from './sheetsInventory'
import { diluted, lme, LME_COLUMN, me, ME_COLUMN, nexus, order, sell, sold, sweat, _refineLME, _refineME, ME_LOG_SHEET_NAME } from './sheetsMeLog'
import { getSpreadsheet, getSheet, saveUpdatedCells } from './sheetsUtils'

async function load(setStage: SetStage): Promise<any> {
    const doc = await getSpreadsheet(setStage)
    return await getSheet(doc, ME_LOG_SHEET_NAME, setStage)
}

async function save(sheet: any, setStage: SetStage): Promise<void> {
    await saveUpdatedCells(sheet, setStage)
}

async function sellME(sheet: any, amount: string, fee: string, value: string): Promise<number> {
    return sell(sheet, amount, fee, value, ME_COLUMN, 'Auction')
}

async function sellLME(sheet: any, amount: string, fee: string, value: string): Promise<number> {
    return sell(sheet, amount, fee, value, LME_COLUMN, 'AuctionL')
}

async function meSold(sheet: any, row: number, amount: string, fee: string, value: string) {
    return sold(sheet, amount, fee, value, row, ME_COLUMN)
}

async function lmeSold(sheet: any, row: number, amount: string, fee: string, value: string) {
    return sold(sheet, amount, fee, value, row, LME_COLUMN)
}

async function orderNexus(sheet: any, markup: string, value: string): Promise<number> {
    return order(sheet, markup, value)
}

async function buySweat(sheet: any, price: string, amount: string): Promise<number> {
    return sweat(sheet, price, amount)
}

async function buyNexus(sheet: any, ttValue: string, markup: string): Promise<number> {
    return nexus(sheet, ttValue, markup)
}

async function buyME(sheet: any, ttValue: string, markup: string): Promise<number> {
    return me(sheet, ttValue, markup)
}

async function buyLME(sheet: any, ttValue: string, markup: string): Promise<number> {
    return lme(sheet, ttValue, markup)
}

async function buyDiluted(sheet: any, ttValue: string, markup: string): Promise<number> {
    return diluted(sheet, ttValue, markup)
}

async function refineME(sheet: any, amount: string): Promise<number> {
    return _refineME(sheet, amount)
}

async function refineLME(sheet: any, amount: string): Promise<number> {
    return _refineLME(sheet, amount)
}

async function newDay(setStage: SetStage) {
    const doc = await getSpreadsheet(setStage)
    newDayInventory(doc, setStage)
}

export default {
    load,
    save,
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