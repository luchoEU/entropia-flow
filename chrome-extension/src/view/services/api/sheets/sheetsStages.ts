const STAGE_INITIALIZING = 1
const STAGE_LOADING_SPREADSHEET = 2
const STAGE_CREATING_BUDGET_SHEET = 3
const STATE_LOADING_BUDGET_SHEET = 4
const STAGE_LOADING_ME_LOG_SHEET = 5
const STAGE_LOADING_INVENTORY_SHEET = 6
const STAGE_SAVING = 7
const STAGE_ERROR = 8

const StageText = [
    'Unknown',
    'Initializing', // STAGE_INITIALIZING
    'Loading spreadsheet', // STAGE_LOADING_SPREADSHEET
    'Creating Budget sheet', // STAGE_CREATING_BUDGET_SHEET
    'Loading Budget sheet', // STATE_LOADING_BUDGET_SHEET
    'Loading ME Log sheet', // STAGE_LOADING_ME_LOG_SHEET
    'Loading Inventory sheet', // STAGE_LOADING_INVENTORY_SHEET
    'Saving', // STAGE_SAVING
]

type SetStage = (stage: number) => void

export {
    STAGE_INITIALIZING,
    STAGE_LOADING_SPREADSHEET,
    STAGE_CREATING_BUDGET_SHEET,
    STATE_LOADING_BUDGET_SHEET,
    STAGE_LOADING_ME_LOG_SHEET,
    STAGE_LOADING_INVENTORY_SHEET,
    STAGE_SAVING,
    STAGE_ERROR,
    StageText,
    SetStage,
}
