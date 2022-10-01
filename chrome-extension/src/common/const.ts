//// CONSTANTS ////

// Limits
const INVENTORY_LIMIT = 15
const STORAGE_QUOTA_BYTES = 102400 // 100k
const STORAGE_QUOTA_BYTES_PER_ITEM = 8100 // 8k - 92 bytes for extra

// Messages with content
const PORT_NAME_BACK_CONTENT = 'EntropiaFlowBackgroundContent'
const MSG_NAME_REGISTER_CONTENT = 'RegisterContent'
const MSG_NAME_REFRESH_CONTENT = 'RefreshContent'
const MSG_NAME_REFRESH_ITEMS = 'RefreshItems'
const MSG_NAME_NEW_INVENTORY = 'NewInventory'

// Messages with view
const PORT_NAME_BACK_VIEW = 'EntropiaFlowBackgroundView'
const MSG_NAME_REGISTER_VIEW = 'RegisterView'
const MSG_NAME_REFRESH_VIEW = 'RefreshView'
const MSG_NAME_REQUEST_NEW = 'RequestNewInventory'
const MSG_NAME_REQUEST_TIMER_ON = 'RequestTimerOn'
const MSG_NAME_REQUEST_TIMER_OFF = 'RequestTimerOff'
const MSG_NAME_REQUEST_SET_LAST = 'RequestSetLast'
const MSG_NAME_OPEN_VIEW = 'OpenView'

// Classes
const CLASS_INFO = 'info'
const CLASS_ERROR = 'error'
const CLASS_NEW_DATE = 'date'
const CLASS_REQUESTED = 'requested'
const CLASS_LAST = 'last'

// Strings
const STRING_LOADING = 'loading...'
const STRING_NO_DATA = 'no data yet'
const STRING_PLEASE_LOG_IN = 'please log in to entropiauniverse.com'
const STRING_ALARM_OFF = 'OFF'

// Alarm
const ALARM_NAME = 'refreshItemsAlarm'

// Storage
const STORAGE_INVENTORY_ = 'inventoryList'
const STORAGE_INVENTORY_STRINGS_ = 'inventoryListStrings'
const STORAGE_LIST_VIEWS = 'views'
const STORAGE_LIST_CONTENTS = 'contents'
const STORAGE_ALARM = 'alarm'
const STORAGE_VIEW = 'view'
const STORAGE_VIEW_MENU = 'menu'
const STORAGE_VIEW_CALCULATOR = 'calculator'
const STORAGE_VIEW_ACTIVES = 'actives'
const STORAGE_VIEW_ORDER = 'order'
const STORAGE_VIEW_SWEAT = 'sweat'
const STORAGE_VIEW_STACKABLE = 'stackable'
const STORAGE_VIEW_REFINE = 'refine'
const STORAGE_VIEW_PEDS = 'peds'
const STORAGE_VIEW_BLACKLIST = 'blacklist'
const STORAGE_VIEW_PERMANENT_BLACKLIST = 'permanent-blacklist'
const STORAGE_VIEW_HISTORY_EXPANDED = 'history-expanded'
const STORAGE_VIEW_STREAM = 'stream'
const STORAGE_VIEW_INVENTORY = 'inventoryView'
const STORAGE_VIEW_ABOUT = 'about'

// Html
const HTML_VIEW = 'view.html'

// Http errors
const ERROR_429 = 'Too many requests'

// Url
const URL_MY_ITEMS = 'https://account.entropiauniverse.com/account/my-account/my-items/json.xml'

// Waits
const NORMAL_WAIT_MINUTES = 3
const LONG_WAIT_MINUTES = 6 // wait longer if the last request didn't do the normal wait period

export {
    INVENTORY_LIMIT,
    PORT_NAME_BACK_CONTENT,
    MSG_NAME_REGISTER_CONTENT,
    MSG_NAME_REFRESH_CONTENT,
    MSG_NAME_REFRESH_ITEMS,
    MSG_NAME_NEW_INVENTORY,
    PORT_NAME_BACK_VIEW,
    MSG_NAME_REGISTER_VIEW,
    MSG_NAME_REFRESH_VIEW,
    MSG_NAME_REQUEST_NEW,
    MSG_NAME_REQUEST_TIMER_ON,
    MSG_NAME_REQUEST_TIMER_OFF,
    MSG_NAME_REQUEST_SET_LAST,
    MSG_NAME_OPEN_VIEW,
    CLASS_INFO,
    CLASS_NEW_DATE,
    CLASS_ERROR,
    CLASS_REQUESTED,
    CLASS_LAST,
    STRING_LOADING,
    STRING_NO_DATA,
    STRING_PLEASE_LOG_IN,
    STRING_ALARM_OFF,
    ALARM_NAME,
    STORAGE_INVENTORY_,
    STORAGE_INVENTORY_STRINGS_,
    STORAGE_QUOTA_BYTES,
    STORAGE_QUOTA_BYTES_PER_ITEM,
    STORAGE_LIST_VIEWS,
    STORAGE_LIST_CONTENTS,
    STORAGE_ALARM,
    STORAGE_VIEW,
    STORAGE_VIEW_MENU,
    STORAGE_VIEW_CALCULATOR,
    STORAGE_VIEW_ACTIVES,
    STORAGE_VIEW_ORDER,
    STORAGE_VIEW_SWEAT,
    STORAGE_VIEW_STACKABLE,
    STORAGE_VIEW_REFINE,
    STORAGE_VIEW_PEDS,
    STORAGE_VIEW_BLACKLIST,
    STORAGE_VIEW_PERMANENT_BLACKLIST,
    STORAGE_VIEW_HISTORY_EXPANDED,
    STORAGE_VIEW_STREAM,
    STORAGE_VIEW_INVENTORY,
    STORAGE_VIEW_ABOUT,
    HTML_VIEW,
    ERROR_429,
    URL_MY_ITEMS,
    NORMAL_WAIT_MINUTES,
    LONG_WAIT_MINUTES
}