import { BlueprintData, BlueprintMaterial, CraftState, BlueprintBudgetMaterial } from '../state/craft';
import { ItemsMap } from '../state/items';
import { BudgetInfoData } from '../../services/api/sheets/sheetsBudget';
import { ItemOwned } from '../state/inventory';
import { getBlueprintList } from './inventory';
import { loadFromWebMultiple, WebLoadResponse } from '../../../web/loader';
import { IWebSource } from '../../../web/sources';
import { Dispatch } from 'react';
import { BlueprintWebData } from '../../../web/state';

const itemNameFromBpName = (bpName: string): string => bpName?.split('Blueprint')[0].trim()
const bpNameFromItemName = (ownedItems: ItemOwned[], itemName: string): string | undefined =>
    getBlueprintList(ownedItems).find(bp => itemNameFromBpName(bp.n) == itemName)?.n

const BP_ITEM_NAME = 'Item'
const BP_BLUEPRINT_NAME = 'Blueprint'
const itemStringFromName = (bpName: string, name: string): string => {
    // This needs to use the auto calc atom instead of bp.c
    // For now, derive from blueprint name
    const itemName = itemNameFromBpName(bpName)
    return name === bpName ? BP_BLUEPRINT_NAME : name === itemName ? BP_ITEM_NAME : name
}

const itemStringFromNameLimited = (itemName: string, name: string): string =>
    name === itemName + ' Blueprint (L)' ? BP_BLUEPRINT_NAME : name === itemName ? BP_ITEM_NAME : name

const nameFromItemStringLimited = (itemName: string, name: string): string =>
    name === BP_BLUEPRINT_NAME ? itemName + ' Blueprint (L)' : name === BP_ITEM_NAME ? itemName : name

const isLimited = (name: string): boolean => name?.endsWith('(L)') ?? false

const budgetInfoFromBp = (bpName: string, bp: BlueprintData, mat: ItemsMap): BudgetInfoData => {
    const itemName = itemNameFromBpName(bpName)
    const materials = bp.user?.materials?.map(m => ({
        name: itemStringFromName(bpName, m.name),
        unitValue: 0, // Will be set by web data
        markup: Number(mat[m.name]?.markup?.value ?? 100) / 100
    })) ?? []

    return {
        itemName,
        materials
    }
}

/**
 * Find blueprint by item name
 * Searches through all blueprints to find one with matching item name
 * Returns tuple of [blueprintName, blueprintData] or undefined
 */
const bpDataFromItemName = (blueprints: { [name: string]: BlueprintData }, itemName: string): [string, BlueprintData] | undefined => {
    for (const [name, bp] of Object.entries(blueprints)) {
        if (itemNameFromBpName(name) === itemName) {
            return [name, bp]
        }
    }
    return undefined
}

/**
 * Clean web data from saved state
 * Removes web and chain properties which may be outdated
 */
const cleanWeb = (state: CraftState): CraftState => {
    const cState: CraftState = JSON.parse(JSON.stringify(state));
    Object.values(cState.blueprints).forEach((bp: BlueprintData) => {
        delete bp.web
        delete bp.chain // no bp recipe so chain is invalid
    })
    return cState;
}

/**
 * Clean state before saving to storage
 * Removes temporary and computed state
 */
const cleanForSave = (state: CraftState): CraftState => {
    const cState: CraftState = JSON.parse(JSON.stringify(state));
    delete cState.activeSession;

    cState.stared.list = cState.stared.list.filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);
    Object.values(cState.blueprints).forEach((bp: BlueprintData) => {
        if (bp.budget) {
            bp.budget = {
                ...bp.budget,
                loading: false,
                stage: 0
            }
        }
        if (bp.budget?.sheet) {
            Object.values(bp.budget.sheet.materials).forEach((m: BlueprintBudgetMaterial) => {
                delete m.buyDone
            })
        }
        if (bp.session && bp.session.step !== 0) {
            bp.session.step = 6 // STEP_DONE
        }
    })
    return cState;
}

export {
    itemNameFromBpName,
    bpNameFromItemName,
    itemStringFromName,
    itemStringFromNameLimited,
    nameFromItemStringLimited,
    isLimited,
    budgetInfoFromBp,
    bpDataFromItemName,
    cleanWeb,
    cleanForSave,
    BP_ITEM_NAME,
    BP_BLUEPRINT_NAME,
}
