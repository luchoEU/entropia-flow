const STAGE_INITIALIZING = 1
const STAGE_LOADING_SPREADSHEET = 2
const STAGE_CREATING_BUDGET_SHEET = 3
const STATE_LOADING_BUDGET_SHEET = 4
const STAGE_SAVING = 5
const STAGE_ERROR = 6
const STAGE_BUDGET_HAS_SHEET = 7

const StageText = [
    'Unknown',
    'Initializing', // STAGE_INITIALIZING
    'Loading Spreadsheet', // STAGE_LOADING_SPREADSHEET
    'Creating Budget sheet', // STAGE_CREATING_BUDGET_SHEET
    'Loading Budget sheet', // STATE_LOADING_BUDGET_SHEET
    'Saving', // STAGE_SAVING
    'Error', // STAGE_ERROR
    'Checking if Budget exists', // STATE_BUDGET_HAS_SHEET
]

type SetStage = (stage: number) => void

export {
    STAGE_INITIALIZING,
    STAGE_LOADING_SPREADSHEET,
    STAGE_CREATING_BUDGET_SHEET,
    STATE_LOADING_BUDGET_SHEET,
    STAGE_SAVING,
    STAGE_ERROR,
    STAGE_BUDGET_HAS_SHEET,
    StageText,
    SetStage,
}
