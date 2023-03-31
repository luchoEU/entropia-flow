interface ActivesLoadingState {
    loadingText: string,
    stage: number,
    errorText?: string
}

interface ActivesItem {
    row: number,
    date: number,
    type: string,
    quantity: string,
    opening: string,
    buyout: string,
    buyoutFee: string,
}

type ActivesList = Array<ActivesItem>

interface ActivesState {
    list?: ActivesList,
    loading?: ActivesLoadingState,
}

const OPERATION_NONE = 0 // needed for orders in active list to hide the sell button
const OPERATION_ME_SELL = 1
const OPERATION_LME_SELL = 2
const OPERATION_NB_SELL = 3
const OPERATION_NEW_DAY = 4
const OPERATION_ME_SOLD = 5
const OPERATION_LME_SOLD = 6
const OPERATION_NB_SOLD = 7
const OPERATION_ADD_ORDER = 8
const OPERATION_ADD_SWEAT = 9
const OPERATION_ADD_FRUIT = 10
const OPERATION_ADD_NEXUS = 11
const OPERATION_ADD_ME = 12
const OPERATION_ADD_LME = 13
const OPERATION_ADD_NB = 14
const OPERATION_ADD_DILUTED = 15
const OPERATION_ADD_SWEETSTUFF = 16
const OPERATION_REFINE_ME = 17
const OPERATION_REFINE_LME = 18
const OPERATION_REFINE_NB = 19
const OPERATION_USE_ME = 20
const OPERATION_USE_LME = 21
const OPERATION_USE_NB = 22

const OperationText = [
    'Unknown',                   // OPERATION_NONE
    'Sell Mind Essence',         // OPERATION_ME_SELL
    'Sell Light Mind Essence',   // OPERATION_LME_SELL
    'Sell Nutrio Bar',           // OPERATION_NB_SELL
    '',         // OPERATION_NEW_DAY
    'Mind Essence sold',         // OPERATION_ME_SOLD
    'Light Mind Essence sold',   // OPERATION_LME_SOLD
    'Nutrio Bar sold',           // OPERATION_NB_SOLD
    'Adding Order',              // OPERATION_ADD_ORDER
    'Adding Sweat',              // OPERATION_ADD_SWEAT
    'Adding Fruit',              // OPERATION_ADD_FRUIT
    'Adding Nexus',              // OPERATION_ADD_NEXUS
    'Adding Mind Essence',       // OPERATION_ADD_ME
    'Adding Light Mind Essence', // OPERATION_ADD_LME
    'Adding Nutrio Bar',         // OPERATION_ADD_NB
    'Adding Diluted Sweat',      // OPERATION_ADD_DILUTED
    'Adding Sweetstuff',         // OPERATION_ADD_SWEETSTUFF
    'Refine Mind Essence',       // OPERATION_REFINE_ME
    'Refine Light Mind Essence', // OPERATION_REFINE_LME
    'Refine Nutrio Bar',         // OPERATION_REFINE_NB
    'Use Mind Essence',          // OPERATION_USE_ME
    'Use Light Mind Essence',    // OPERATION_USE_LME
    'Use Nutrio Bar',            // OPERATION_USE_NB
]

export {
    ActivesLoadingState,
    ActivesItem,
    ActivesList,
    ActivesState,
}
