interface CraftState {
    activeSession?: BlueprintData
    blueprints: BlueprintData[]
}

interface BlueprintData {
    name: string
    itemName: string
    info: BlueprintInfo
    budget: BlueprintBudget
    session: BlueprintSession
    inventory?: BlueprintInventory
}

interface BlueprintInfo {
    loading: boolean
    url: string
    materials: BlueprintMaterial[]
    errorText?: string
}

interface BlueprintBudget {
    loading: boolean
    stage: number
    clickMUCost?: number
    total?: number
    peds?: number
    errorText?: string
}

const STEP_INACTIVE = 0
const STEP_REFRESH_TO_START = 1
const STEP_ERROR = 2
const STEP_READY = 3
const STEP_REFRESH_TO_END = 4
const STEP_SAVING = 5

interface BlueprintSession {
    step: number
    stage?: number // STEP_SAVING
    errorText?: string
    startMaterials?: {
        n: string,
        q: number
    }[]
}

interface BlueprintInventory {
    clicksAvailable: number
    clickTTCost: number
    residueNeeded: number
}

interface BlueprintMaterial {
    name: string
    quantity: number
    type: string,
    value: number,
    available?: number // inventory
    clicks?: number // inventory
    markup?: number // budget
    budgetCount?: number // budget
}

interface BluprintWebData {
    Name: string
    ItemValue: string
    StatusCode: number
    Url: string
    Material: BlueprintWebMaterial[]
}

interface BlueprintWebMaterial {
    Name: string
    Quantity: number
    Type: string
    Value: string
}

export {
    CraftState,
    BlueprintData,
    BlueprintMaterial,
    BlueprintSession,
    BluprintWebData,
    BlueprintWebMaterial,
    STEP_INACTIVE,
    STEP_REFRESH_TO_START,
    STEP_ERROR,
    STEP_READY,
    STEP_REFRESH_TO_END,
    STEP_SAVING,
}
