import { WebLoadResponse } from "../../../web/loader"
import { BlueprintWebData } from "../../../web/state"

const CRAFT_TABULAR_BLUEPRINTS = '[craft] blueprints'

interface CraftState {
    activeSession?: string
    activePlanet?: string
    blueprints: { [ name: string ]: BlueprintData }
    editModeBlueprintName?: string
    stared: {
        expanded: boolean
        sortType: number
        filter: string
        list: Array<string>
    }
    options: CraftOptions
    web?: CraftingWebData
    user?: CraftingUserData
    c: { // calculated from previous
        filteredStaredBlueprints: Array<BlueprintData>
        residues: { [ name: string ]: number } // available in Inventory
    }
}

interface CraftOptions {
    owned: boolean // show only owned blueprints
}

interface CraftingWebData {
    simpleBlueprintList: string[]
}

interface CraftingUserData {
    materials: { name: string, quantity: string }[]
}

interface BlueprintStateWebData {
    blueprint: WebLoadResponse<BlueprintWebData>
}

interface BlueprintData {
    name: string
    budget?: BlueprintBudget
    session?: BlueprintSession
    chain?: string

    web?: BlueprintStateWebData
    user?: CraftingUserData

    c?: { // calculated
        itemName: string
        owned?: boolean
        clicks?: BlueprintClicks
        materials?: BlueprintMaterial[]
        suggestedMaterials?: { index: number, list: string[] }
    }
}

interface BlueprintClicks {
    bp: number
    available: number
    limitingItems: Array<string>
    ttCost: number
    residueNeeded: number
}

interface BlueprintMaterial {
    name: string
    type: string
    quantity: number
    value: number
    available?: number // Inventory
    clicks?: number // Inventory, available / quantity
}

interface BlueprintBudget {
    loading: boolean
    stage: number
    hasPage: boolean
    errorText?: string
    sheet?: {
        clickMUCost: number
        total: number
        peds: number
        materials: BlueprintBudgetMaterials
    }
}

type BlueprintBudgetMaterials = { [ name: string ]: BlueprintBudgetMaterial}

interface BlueprintBudgetMaterial {
    markup: number
    count: number
    buyCost?: string
    buyDone?: boolean
    withFee?: boolean
}

const STEP_INACTIVE = 0
const STEP_REFRESH_TO_START = 1
const STEP_REFRESH_ERROR = 2
const STEP_READY = 3
const STEP_REFRESH_TO_END = 4
const STEP_SAVING = 5
const STEP_DONE = 6

interface BlueprintSession {
    step: number
    stage?: number // STEP_SAVING
    errorText?: string
    diffMaterials?: BlueprintSessionDiff[]
}

interface BlueprintSessionDiff {
    n: string,
    q: number,
    v: number
}

export {
    CRAFT_TABULAR_BLUEPRINTS,
    CraftState,
    CraftOptions,
    CraftingWebData,
    CraftingUserData,
    BlueprintData,
    BlueprintSession,
    BlueprintSessionDiff,
    BlueprintStateWebData,
    BlueprintMaterial,
    BlueprintClicks,
    BlueprintBudget,
    BlueprintBudgetMaterial,
    BlueprintBudgetMaterials,
    STEP_INACTIVE,
    STEP_REFRESH_TO_START,
    STEP_REFRESH_ERROR,
    STEP_READY,
    STEP_REFRESH_TO_END,
    STEP_SAVING,
    STEP_DONE,
}
