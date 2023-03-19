import { LOCAL_STORAGE, SYNC_STORAGE } from "../../../chrome/storageAreaChrome";
import {
    STORAGE_VIEW_ABOUT,
    STORAGE_VIEW_ACTIVES,
    STORAGE_VIEW_BLACKLIST,
    STORAGE_VIEW_PERMANENT_BLACKLIST,
    STORAGE_VIEW_CALCULATOR,
    STORAGE_VIEW_HISTORY_EXPANDED,
    STORAGE_VIEW_INVENTORY,
    STORAGE_VIEW_MENU,
    STORAGE_VIEW_ORDER,
    STORAGE_VIEW_PEDS,
    STORAGE_VIEW_REFINE,
    STORAGE_VIEW_STACKABLE,
    STORAGE_VIEW_STREAM,
    STORAGE_VIEW_SWEAT,
    STORAGE_VIEW_USE,
    STORAGE_VIEW_FRUIT,
    STORAGE_VIEW_CRAFT,
    STORAGE_VIEW_SETTINGS
} from "../../../common/const";
import { AboutState } from "../../application/state/about";
import { ActivesList } from "../../application/state/actives";
import { CalculatorStateIn } from "../../application/state/calculator";
import { CraftState } from "../../application/state/craft";
import { FruitStateIn } from "../../application/state/fruit";
import { InventoryState } from "../../application/state/inventory";
import { ViewPedData } from "../../application/state/last";
import { OrderState } from "../../application/state/order";
import { RefineState } from "../../application/state/refine";
import { SettingsState } from "../../application/state/settings";
import { StackableStateIn } from "../../application/state/stackable";
import { StreamState } from "../../application/state/stream";
import { SweatStateIn } from "../../application/state/sweat";
import { UseState } from "../../application/state/use";

async function saveMenu(menu: number) {
    await LOCAL_STORAGE.set(STORAGE_VIEW_MENU, menu)
}

async function loadMenu(): Promise<number> {
    return await LOCAL_STORAGE.get(STORAGE_VIEW_MENU)
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

async function saveRefine(state: RefineState) {
    await SYNC_STORAGE.set(STORAGE_VIEW_REFINE, state)
}

async function loadRefine(): Promise<RefineState> {
    return await SYNC_STORAGE.get(STORAGE_VIEW_REFINE)
}

async function saveUse(state: UseState) {
    await SYNC_STORAGE.set(STORAGE_VIEW_USE, state)
}

async function loadUse(): Promise<UseState> {
    return await SYNC_STORAGE.get(STORAGE_VIEW_USE)
}

async function savePeds(state: Array<ViewPedData>) {
    await SYNC_STORAGE.set(STORAGE_VIEW_PEDS, state)
}

async function loadPeds(): Promise<Array<ViewPedData>> {
    return await SYNC_STORAGE.get(STORAGE_VIEW_PEDS)
}

async function saveBlacklist(list: Array<string>) {
    await SYNC_STORAGE.set(STORAGE_VIEW_BLACKLIST, list)
}

async function loadBlacklist(): Promise<Array<string>> {
    return await SYNC_STORAGE.get(STORAGE_VIEW_BLACKLIST)
}

async function savePermanentBlacklist(list: Array<string>) {
    await SYNC_STORAGE.set(STORAGE_VIEW_PERMANENT_BLACKLIST, list)
}

async function loadPermanentBlacklist(): Promise<Array<string>> {
    return await SYNC_STORAGE.get(STORAGE_VIEW_PERMANENT_BLACKLIST)
}

async function saveHistoryExpanded(expanded: boolean) {
    await SYNC_STORAGE.set(STORAGE_VIEW_HISTORY_EXPANDED, expanded)
}

async function loadHistoryExpanded(): Promise<boolean> {
    return await SYNC_STORAGE.get(STORAGE_VIEW_HISTORY_EXPANDED)
}

async function saveStream(state: StreamState) {
    await SYNC_STORAGE.set(STORAGE_VIEW_STREAM, state)
}

async function loadStream(): Promise<StreamState> {
    return await SYNC_STORAGE.get(STORAGE_VIEW_STREAM)
}

async function saveInventoryState(state: InventoryState) {
    await SYNC_STORAGE.set(STORAGE_VIEW_INVENTORY, state)
}

async function loadInventoryState(): Promise<InventoryState> {
    return await SYNC_STORAGE.get(STORAGE_VIEW_INVENTORY)
}

async function saveCraft(state: CraftState) {
    await LOCAL_STORAGE.set(STORAGE_VIEW_CRAFT, state)
}

async function loadCraft(): Promise<CraftState> {
    return await LOCAL_STORAGE.get(STORAGE_VIEW_CRAFT)
}

async function saveSettings(state: SettingsState) {
    await SYNC_STORAGE.set(STORAGE_VIEW_SETTINGS, state)
}

async function loadSettings(): Promise<SettingsState> {
    return await SYNC_STORAGE.get(STORAGE_VIEW_SETTINGS)
}

async function saveAbout(state: AboutState) {
    await SYNC_STORAGE.set(STORAGE_VIEW_ABOUT, state)
}

async function loadAbout(): Promise<InventoryState> {
    return await SYNC_STORAGE.get(STORAGE_VIEW_ABOUT)
}

export default {
    saveMenu,
    loadMenu,
    saveCalculator,
    loadCalculator,
    saveActives,
    loadActives,
    saveOrder,
    loadOrder,
    saveSweat,
    loadSweat,
    saveFruit,
    loadFruit,
    saveStackable,
    loadStackable,
    saveRefine,
    loadRefine,
    saveUse,
    loadUse,
    savePeds,
    loadPeds,
    saveBlacklist,
    loadBlacklist,
    savePermanentBlacklist,
    loadPermanentBlacklist,
    saveHistoryExpanded,
    loadHistoryExpanded,
    saveStream,
    loadStream,
    saveInventoryState,
    loadInventoryState,
    saveCraft,
    loadCraft,
    saveSettings,
    loadSettings,
    saveAbout,
    loadAbout,
}