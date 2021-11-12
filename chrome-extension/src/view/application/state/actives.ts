interface ACTIVES_LOADING_STATE {
    operation: number,
    stage: number,
    errorText?: string
}

interface ACTIVES_ITEM {
    row: number,
    date: number,
    operation: number,
    type: string,
    quantity: string,
    opening: string,
    buyout: string,
    buyoutFee: string,
}

interface ACTIVES_STATE {
    list?: Array<ACTIVES_ITEM>,
    loading?: ACTIVES_LOADING_STATE,
}

const OPERATION_NONE = 0
const OPERATION_ME_SELL = 1
const OPERATION_LME_SELL = 2
const OPERATION_NEW_DAY = 3
const OPERATION_ME_SOLD = 4
const OPERATION_LME_SOLD = 5
const OPERATION_ADD_ORDER = 6
const OPERATION_ADD_SWEAT = 7
const OPERATION_ADD_NEXUS = 8
const OPERATION_ADD_ME = 9
const OPERATION_ADD_LME = 10
const OPERATION_ADD_DILUTED = 11
const OPERATION_REFINE_ME = 12
const OPERATION_REFINE_LME = 13

const OperationText = [
    'Unknown',                   // OPERATION_NONE
    'Sell Mind Essence',         // OPERATION_ME_SELL
    'Sell Light Mind Essence',   // OPERATION_LME_SELL
    'Preparing New Day',         // OPERATION_NEW_DAY
    'Mind Essence sold',         // OPERATION_ME_SOLD
    'Light Mind Essence sold',   // OPERATION_LME_SOLD
    'Adding Order',              // OPERATION_ADD_ORDER
    'Adding Sweat',              // OPERATION_ADD_SWEAT
    'Adding Nexus',              // OPERATION_ADD_NEXUS
    'Adding Mind Essence',       // OPERATION_ADD_ME
    'Adding Light Mind Essence', // OPERATION_ADD_DILUTED
    'Adding Diluted Sweat',      // OPERATION_ADD_DILUTED
    'Refine Mind Essence',       // OPERATION_REFINE_ME
    'Refine Light Mind Essence', // OPERATION_REFINE_LME
]

const STAGE_INITIALIZING = 1
const STAGE_LOADING_SPREADSHEET = 2
const STAGE_LOADING_ME_LOG_SHEET = 3
const STAGE_SAVING = 4
const STAGE_ERROR = 5

const StageText = [
    'Unknown',
    'Initializing', // STAGE_INITIALIZING
    'Loading spreadsheet', // STAGE_LOADING_SPREADSHEET
    'Loading ME Log sheet', // STAGE_LOADING_ME_LOG_SHEET
    'Saving', // STAGE_SAVING
]

type SetStage = (stage: number) => void

export {
    ACTIVES_LOADING_STATE,
    ACTIVES_ITEM,
    ACTIVES_STATE,
    OPERATION_NONE,
    OPERATION_ME_SELL,
    OPERATION_LME_SELL,
    OPERATION_ME_SOLD,
    OPERATION_LME_SOLD,
    OPERATION_NEW_DAY,
    OPERATION_ADD_ORDER,
    OPERATION_ADD_SWEAT,
    OPERATION_ADD_NEXUS,
    OPERATION_ADD_ME,
    OPERATION_ADD_LME,
    OPERATION_ADD_DILUTED,
    OPERATION_REFINE_ME,
    OPERATION_REFINE_LME,
    STAGE_INITIALIZING,
    STAGE_LOADING_SPREADSHEET,
    STAGE_LOADING_ME_LOG_SHEET,
    STAGE_SAVING,
    STAGE_ERROR,
    OperationText,
    StageText,
    SetStage,
}