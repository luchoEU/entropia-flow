import { LOCAL_STORAGE, SYNC_STORAGE } from "../../../chrome/chromeStorageArea";
import {
    STORAGE_VIEW_ABOUT,
    STORAGE_VIEW_ACTIVES,
    STORAGE_VIEW_CALCULATOR,
    STORAGE_VIEW_INVENTORY,
    STORAGE_VIEW_ORDER,
    STORAGE_VIEW_REFINE,
    STORAGE_VIEW_STACKABLE,
    STORAGE_VIEW_STREAM,
    STORAGE_VIEW_SWEAT,
    STORAGE_VIEW_USE,
    STORAGE_VIEW_FRUIT,
    STORAGE_VIEW_CRAFT,
    STORAGE_VIEW_SETTINGS,
    STORAGE_VIEW_REFINED,
    STORAGE_VIEW_ITEMS,
    STORAGE_VIEW_GAME_LOG,
    STORAGE_VIEW_CONNECTION,
    STORAGE_VIEW_BUDGET,
    STORAGE_VIEW_INVENTORY_BY_STORE,
    STORAGE_VIEW_TABULAR,
    STORAGE_VIEW_EXPANDABLE,
    STORAGE_VIEW_TRADE,
    STORAGE_VIEW_MODE,
    STORAGE_VIEW_LAST
} from "../../../common/const";
import { AboutState } from "../../application/state/about";
import { ActivesList } from "../../application/state/actives";
import { BudgetState } from "../../application/state/budget";
import { CalculatorStateIn } from "../../application/state/calculator";
import { ConnectionState } from "../../application/state/connection";
import { CraftState } from "../../application/state/craft";
import ExpandableState from "../../application/state/expandable";
import { FruitStateIn } from "../../application/state/fruit";
import { InventoryState } from "../../application/state/inventory";
import { LastRequiredState, ViewPedData } from "../../application/state/last";
import { GameLogState } from "../../application/state/log";
import { ItemsState } from "../../application/state/items";
import ModeState from "../../application/state/mode";
import { OrderState } from "../../application/state/order";
import { RefineState } from "../../application/state/refine";
import { RefinedState } from "../../application/state/refined";
import { SettingsState } from "../../application/state/settings";
import { StackableStateIn } from "../../application/state/stackable";
import { StreamState } from "../../application/state/stream";
import { SweatStateIn } from "../../application/state/sweat";
import { TabularState } from "../../application/state/tabular";
import { TradeState } from "../../application/state/trade";
import { UseState } from "../../application/state/use";

import pako from 'pako';

function _compress(json: object): string {
    const jsonString = JSON.stringify(json);
    const compressed = pako.deflate(jsonString, { to: 'string' });
    return Buffer.from(compressed).toString('base64');
}

function _uncompress(compressed: any): any {
    if (!compressed) return compressed
    const compressedData = Buffer.from(compressed, 'base64');
    const uncompressed = pako.inflate(compressedData, { to: 'string' });
    return JSON.parse(uncompressed);
}

async function saveCalculator(state: CalculatorStateIn) {
    await SYNC_STORAGE.set(STORAGE_VIEW_CALCULATOR, state)
}

async function loadCalculator(): Promise<CalculatorStateIn> {
    return await SYNC_STORAGE.get(STORAGE_VIEW_CALCULATOR)
}

async function saveActives(list: ActivesList) {
    await SYNC_STORAGE.set(STORAGE_VIEW_ACTIVES, list)
}

async function loadActives(): Promise<ActivesList> {
    return await SYNC_STORAGE.get(STORAGE_VIEW_ACTIVES)
}

async function saveOrder(state: OrderState) {
    await SYNC_STORAGE.set(STORAGE_VIEW_ORDER, state)
}

async function loadOrder(): Promise<OrderState> {
    return await SYNC_STORAGE.get(STORAGE_VIEW_ORDER)
}

async function saveSweat(state: SweatStateIn) {
    await SYNC_STORAGE.set(STORAGE_VIEW_SWEAT, state)
}

async function loadSweat(): Promise<SweatStateIn> {
    return await SYNC_STORAGE.get(STORAGE_VIEW_SWEAT)
}

async function saveTrade(state: TradeState) {
    await SYNC_STORAGE.set(STORAGE_VIEW_TRADE, state)
}

async function loadTrade(): Promise<TradeState> {
    return await SYNC_STORAGE.get(STORAGE_VIEW_TRADE)
}

async function saveFruit(state: FruitStateIn) {
    await SYNC_STORAGE.set(STORAGE_VIEW_FRUIT, state)
}

async function loadFruit(): Promise<FruitStateIn> {
    return await SYNC_STORAGE.get(STORAGE_VIEW_FRUIT)
}

async function saveStackable(state: StackableStateIn) {
    await SYNC_STORAGE.set(STORAGE_VIEW_STACKABLE, state)
}

async function loadStackable(): Promise<StackableStateIn> {
    return await SYNC_STORAGE.get(STORAGE_VIEW_STACKABLE)
}

async function saveMode(state: ModeState) {
    await SYNC_STORAGE.set(STORAGE_VIEW_MODE, state)
}

async function loadMode(): Promise<ModeState> {
    return await SYNC_STORAGE.get(STORAGE_VIEW_MODE)
}


async function saveRefine(state: RefineState) {
    await SYNC_STORAGE.set(STORAGE_VIEW_REFINE, state)
}

async function loadRefine(): Promise<RefineState> {
    return await SYNC_STORAGE.get(STORAGE_VIEW_REFINE)
}

async function saveRefined(state: RefinedState) {
    await SYNC_STORAGE.set(STORAGE_VIEW_REFINED, state)
}

async function loadRefined(): Promise<RefinedState> {
    return await SYNC_STORAGE.get(STORAGE_VIEW_REFINED)
}

async function saveUse(state: UseState) {
    await SYNC_STORAGE.set(STORAGE_VIEW_USE, state)
}

async function loadUse(): Promise<UseState> {
    return await SYNC_STORAGE.get(STORAGE_VIEW_USE)
}

async function saveExpandable(expandable: ExpandableState) {
    await SYNC_STORAGE.set(STORAGE_VIEW_EXPANDABLE,expandable)
}

async function loadExpandable(): Promise<ExpandableState> {
    return await SYNC_STORAGE.get(STORAGE_VIEW_EXPANDABLE)
}

async function saveLast(state: LastRequiredState) {
    await SYNC_STORAGE.set(STORAGE_VIEW_LAST, state)
}

async function loadLast(): Promise<LastRequiredState> {
    return await SYNC_STORAGE.get(STORAGE_VIEW_LAST)
}

async function saveStream(state: StreamState) {
    await LOCAL_STORAGE.set(STORAGE_VIEW_STREAM, state) // TODO: save in SYNC_STORAGE with user images separatetly
}

async function loadStream(): Promise<StreamState> {
    return await LOCAL_STORAGE.get(STORAGE_VIEW_STREAM)
}

async function saveInventoryState(state: InventoryState) {
    await SYNC_STORAGE.set(STORAGE_VIEW_INVENTORY, state)
}

async function loadInventoryState(): Promise<InventoryState> {
    return await SYNC_STORAGE.get(STORAGE_VIEW_INVENTORY)
}

async function saveInventoryByStoreState(state: InventoryState) {
    await LOCAL_STORAGE.set(STORAGE_VIEW_INVENTORY_BY_STORE, _compress(state))
}

async function loadInventoryByStoreState(): Promise<InventoryState> {
    var compressedState = await LOCAL_STORAGE.get(STORAGE_VIEW_INVENTORY_BY_STORE)
    return _uncompress(compressedState)
}

async function saveCraft(state: CraftState) {
    await LOCAL_STORAGE.set(STORAGE_VIEW_CRAFT, state)
}

async function loadCraft(): Promise<CraftState> {
    return await LOCAL_STORAGE.get(STORAGE_VIEW_CRAFT)
}

async function saveTabular(state: TabularState) {
    await LOCAL_STORAGE.set(STORAGE_VIEW_TABULAR, state)
}

async function loadTabular(): Promise<TabularState> {
    return await LOCAL_STORAGE.get(STORAGE_VIEW_TABULAR)
}

async function saveItems(state: ItemsState) {
    await SYNC_STORAGE.set(STORAGE_VIEW_ITEMS, _compress(state))
}

async function loadItems(): Promise<ItemsState> {
    // chrome.storage.sync.QUOTA_BYTES_PER_ITEM
    // TODO: refactor InventoryStorage and _compress
    const compressedState = await SYNC_STORAGE.get(STORAGE_VIEW_ITEMS)
    return _uncompress(compressedState)
}

async function saveItemsCache(state: ItemsState) {
    await LOCAL_STORAGE.set(STORAGE_VIEW_ITEMS, state)
}

async function loadItemsCache(): Promise<ItemsState> {
    return await LOCAL_STORAGE.get(STORAGE_VIEW_ITEMS)
}

async function saveBudget(state: BudgetState) {
    await LOCAL_STORAGE.set(STORAGE_VIEW_BUDGET, state)
}

async function loadBudget(): Promise<BudgetState> {
    return await LOCAL_STORAGE.get(STORAGE_VIEW_BUDGET)
}

async function saveSettings(state: SettingsState) {
    await SYNC_STORAGE.set(STORAGE_VIEW_SETTINGS, state)
}

async function loadSettings(): Promise<SettingsState> {
    return await SYNC_STORAGE.get(STORAGE_VIEW_SETTINGS)
}

async function saveConnection(state: ConnectionState) {
    await SYNC_STORAGE.set(STORAGE_VIEW_CONNECTION, state)
}

async function loadConnection(): Promise<ConnectionState> {
    return await SYNC_STORAGE.get(STORAGE_VIEW_CONNECTION)
}
async function saveAbout(state: AboutState) {
    await SYNC_STORAGE.set(STORAGE_VIEW_ABOUT, state)
}

async function loadAbout(): Promise<AboutState> {
    return await SYNC_STORAGE.get(STORAGE_VIEW_ABOUT)
}

async function saveGameLog(state: GameLogState) {
    await LOCAL_STORAGE.set(STORAGE_VIEW_GAME_LOG, state)
}

async function loadGameLog(): Promise<GameLogState> {
    return await LOCAL_STORAGE.get(STORAGE_VIEW_GAME_LOG)
}

export default {
    saveCalculator,
    loadCalculator,
    saveActives,
    loadActives,
    saveOrder,
    loadOrder,
    saveSweat,
    loadSweat,
    saveTrade,
    loadTrade,
    saveFruit,
    loadFruit,
    saveStackable,
    loadStackable,
    saveMode,
    loadMode,
    saveRefine,
    loadRefine,
    saveRefined,
    loadRefined,
    saveUse,
    loadUse,
    saveExpandable,
    loadExpandable,
    saveLast,
    loadLast,
    saveStream,
    loadStream,
    saveInventoryState,
    loadInventoryState,
    saveInventoryByStoreState,
    loadInventoryByStoreState,
    saveCraft,
    loadCraft,
    saveTabular,
    loadTabular,
    saveItems,
    loadItems,
    saveItemsCache,
    loadItemsCache,
    saveBudget,
    loadBudget,
    saveSettings,
    loadSettings,
    saveConnection,
    loadConnection,
    saveAbout,
    loadAbout,
    saveGameLog,
    loadGameLog,
}