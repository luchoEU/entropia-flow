//// CONSTANTS ////

// Limits
const INVENTORY_LIMIT = 15
const STORAGE_QUOTA_BYTES = 102400 // 100k
const STORAGE_QUOTA_BYTES_PER_ITEM = 8100 // 8k - 92 bytes for extra

// Messages with content
const PORT_NAME_BACK_CONTENT = 'EntropiaFlowBackgroundContent'
const MSG_NAME_REGISTER_CONTENT = 'RegisterContent'
const MSG_NAME_REFRESH_CONTENT = 'RefreshContent'
const MSG_NAME_REFRESH_ITEMS_AJAX = 'RefreshItemsAjax'
const MSG_NAME_REFRESH_WAKE_UP = 'RefreshWakeUp'
const MSG_NAME_NEW_INVENTORY = 'NewInventory'
const MSG_NAME_LOADING = 'Loading'

// Messages with view
const PORT_NAME_BACK_VIEW = 'EntropiaFlowBackgroundView'
const MSG_NAME_REGISTER_VIEW = 'RegisterView'
const MSG_NAME_REFRESH_VIEW = 'RefreshView'
const MSG_NAME_ACTION_VIEW = 'ActionView'
const MSG_NAME_USED_LAYOUTS_VIEW = 'UsedLayoutsView'
const MSG_NAME_NOTIFICATION_VIEW = 'NotificationView'
const MSG_NAME_BLUEPRINT_LIST = 'BlueprintList'
const MSG_NAME_REQUEST_NEW = 'RequestNewInventory'
const MSG_NAME_REQUEST_TIMER_ON = 'RequestTimerOn'
const MSG_NAME_REQUEST_TIMER_OFF = 'RequestTimerOff'
const MSG_NAME_REQUEST_SET_LAST = 'RequestSetLast'
const MSG_NAME_OPEN_VIEW = 'OpenView'
const MSG_NAME_SEND_WEB_SOCKET_MESSAGE = 'SendWebSocketMessage'
const MSG_NAME_SET_WEB_SOCKET_URL = 'SetWebSocketUrl'
const MSG_NAME_RETRY_WEB_SOCKET = 'RetryWebSocket'

// Classes
const CLASS_INFO = 'info'
const CLASS_ERROR = 'error'
const CLASS_NEW_DATE = 'date'
const CLASS_REQUESTED = 'requested'
const CLASS_LAST = 'last'

// Strings
const STRING_CONNECTING = 'connecting...'
const STRING_LOADING_PAGE = 'loading page...'
const STRING_LOADING_ITEMS = 'loading items...'
const STRING_NOT_READY = 'not ready' // when items in html are not loaded yet
const STRING_NO_DATA = 'no data yet'
const STRING_PLEASE_LOG_IN = 'please log in to entropiauniverse.com'
const STRING_WAIT_3_MINUTES = 'please wait the 3 minutes cooldown to avoid getting blocked'
const STRING_CONNECTION_BACKGROUND_TO_CONTENT = 'connection from background to content failed'
const STRING_SELECT_ITEMS_TAB = 'please manually select entropia universe items tab to unfreeze it'

// Alarm
const AJAX_ALARM_NAME = 'refreshItemsAjaxAlarm'
const FROZEN_ALARM_NAME = 'refreshItemsFrozenAlarm'
const DEAD_ALARM_NAME = 'refreshItemsDeadAlarm'
const TICK_ALARM_NAME = 'refreshItemsTickAlarm'

// Storage
const STORAGE_INVENTORY_ = 'inventoryList'
const STORAGE_INVENTORY_STRINGS_ = 'inventoryListStrings'
const STORAGE_TAB_VIEWS = 'tabViews'
const STORAGE_TAB_CONTENTS = 'tabContents'
const STORAGE_ALARM = 'alarm'
const STORAGE_GAME_LOG = 'gameLog'
const STORAGE_VIEW = 'view'
const STORAGE_VIEW_CALCULATOR = 'calculator'
const STORAGE_VIEW_ACTIVES = 'actives'
const STORAGE_VIEW_ORDER = 'order'
const STORAGE_VIEW_SWEAT = 'sweat'
const STORAGE_VIEW_TRADE = 'trade'
const STORAGE_VIEW_FRUIT = 'fruit'
const STORAGE_VIEW_STACKABLE = 'stackable'
const STORAGE_VIEW_MODE = 'mode'
const STORAGE_VIEW_REFINE = 'refine'
const STORAGE_VIEW_REFINED = 'refined'
const STORAGE_VIEW_USE = 'use'
const STORAGE_VIEW_EXPANDABLE = 'expandable'
const STORAGE_VIEW_LAST = 'last'
const STORAGE_VIEW_STREAM = 'stream'
const STORAGE_VIEW_INVENTORY = 'inventoryView'
const STORAGE_VIEW_INVENTORY_BY_STORE = 'inventoryByStore'
const STORAGE_VIEW_CRAFT = 'craft'
const STORAGE_VIEW_ITEMS = 'items'
const STORAGE_VIEW_BUDGET = 'budget'
const STORAGE_VIEW_SETTINGS = 'settings'
const STORAGE_VIEW_CONNECTION = 'connection'
const STORAGE_VIEW_ABOUT = 'about'
const STORAGE_VIEW_GAME_LOG = 'log'
const STORAGE_VIEW_TABULAR = 'tabular'

// Html
const HTML_VIEW = 'view.html'

// Http errors
const ERROR_425 = 'Access blocked, contact MindArk support to unblock'
const ERROR_429 = 'Too many requests'

// Url
const URL_MY_ITEMS_PAGE = 'https://account.entropiauniverse.com/account/my-account/my-items/'
const URL_MY_ITEMS_DATA = URL_MY_ITEMS_PAGE + 'json.xml'

// Waits
const TICK_SECONDS = 1 // updates countdown
const FIRST_HTML_CHECK_WAIT_SECONDS = 5 // read items from html after 5 seconds
const NEXT_HTML_CHECK_WAIT_SECONDS = 2 // if they weren't ready check again every 2 seconds
const NORMAL_WAIT_SECONDS = 3 * 60 // minimum wait to avoid ERROR_429
const FROZEN_CHECK_WAIT_SECONDS = 10 // check if tab is frozen every 10 seconds
const DEAD_CHECK_WAIT_SECONDS = 5 * 60 // consider tab dead if it doesn't respond for 5 minutes
const FIRST_WAIT_SECONDS = 6 * 60 // wait longer the first time after a page refresh, in case there was another recent refresh before
const AFTER_MANUAL_WAIT_SECONDS = 6 * 60 // wait longer if the user requested a refresh
const TOO_MANY_WAIT_SECONDS = 60 * 60 // wait an hour if the server received too many requests
const ACCESS_BLOCKED_WAIT_SECONDS = 365 * 24 * 60 * 60 // contect support to unblock ERROR_425

export {
    INVENTORY_LIMIT,
    PORT_NAME_BACK_CONTENT,
    MSG_NAME_REGISTER_CONTENT,
    MSG_NAME_REFRESH_CONTENT,
    MSG_NAME_REFRESH_ITEMS_AJAX,
    MSG_NAME_REFRESH_WAKE_UP,
    MSG_NAME_NEW_INVENTORY,
    MSG_NAME_LOADING,
    PORT_NAME_BACK_VIEW,
    MSG_NAME_REGISTER_VIEW,
    MSG_NAME_REFRESH_VIEW,
    MSG_NAME_ACTION_VIEW,
    MSG_NAME_USED_LAYOUTS_VIEW,
    MSG_NAME_NOTIFICATION_VIEW,
    MSG_NAME_BLUEPRINT_LIST,
    MSG_NAME_REQUEST_NEW,
    MSG_NAME_REQUEST_TIMER_ON,
    MSG_NAME_REQUEST_TIMER_OFF,
    MSG_NAME_REQUEST_SET_LAST,
    MSG_NAME_OPEN_VIEW,
    MSG_NAME_SEND_WEB_SOCKET_MESSAGE,
    MSG_NAME_SET_WEB_SOCKET_URL,
    MSG_NAME_RETRY_WEB_SOCKET,
    CLASS_INFO,
    CLASS_NEW_DATE,
    CLASS_ERROR,
    CLASS_REQUESTED,
    CLASS_LAST,
    STRING_CONNECTING,
    STRING_LOADING_PAGE,
    STRING_LOADING_ITEMS,
    STRING_CONNECTION_BACKGROUND_TO_CONTENT,
    STRING_SELECT_ITEMS_TAB,
    STRING_NOT_READY,
    STRING_NO_DATA,
    STRING_PLEASE_LOG_IN,
    STRING_WAIT_3_MINUTES,
    AJAX_ALARM_NAME,
    FROZEN_ALARM_NAME,
    DEAD_ALARM_NAME,
    TICK_ALARM_NAME,
    STORAGE_INVENTORY_,
    STORAGE_INVENTORY_STRINGS_,
    STORAGE_QUOTA_BYTES,
    STORAGE_QUOTA_BYTES_PER_ITEM,
    STORAGE_TAB_VIEWS,
    STORAGE_TAB_CONTENTS,
    STORAGE_ALARM,
    STORAGE_GAME_LOG,
    STORAGE_VIEW,
    STORAGE_VIEW_CALCULATOR,
    STORAGE_VIEW_ACTIVES,
    STORAGE_VIEW_ORDER,
    STORAGE_VIEW_SWEAT,
    STORAGE_VIEW_TRADE,
    STORAGE_VIEW_FRUIT,
    STORAGE_VIEW_STACKABLE,
    STORAGE_VIEW_MODE,
    STORAGE_VIEW_REFINE,
    STORAGE_VIEW_REFINED,
    STORAGE_VIEW_USE,
    STORAGE_VIEW_EXPANDABLE,
    STORAGE_VIEW_LAST,
    STORAGE_VIEW_STREAM,
    STORAGE_VIEW_INVENTORY,
    STORAGE_VIEW_INVENTORY_BY_STORE,
    STORAGE_VIEW_CRAFT,
    STORAGE_VIEW_ITEMS,
    STORAGE_VIEW_BUDGET,
    STORAGE_VIEW_SETTINGS,
    STORAGE_VIEW_CONNECTION,
    STORAGE_VIEW_ABOUT,
    STORAGE_VIEW_GAME_LOG,
    STORAGE_VIEW_TABULAR,
    HTML_VIEW,
    ERROR_425,
    ERROR_429,
    URL_MY_ITEMS_PAGE,
    URL_MY_ITEMS_DATA,
    TICK_SECONDS,
    FIRST_HTML_CHECK_WAIT_SECONDS,
    NEXT_HTML_CHECK_WAIT_SECONDS,
    NORMAL_WAIT_SECONDS,
    FROZEN_CHECK_WAIT_SECONDS,
    DEAD_CHECK_WAIT_SECONDS,
    FIRST_WAIT_SECONDS,
    AFTER_MANUAL_WAIT_SECONDS,
    TOO_MANY_WAIT_SECONDS,
    ACCESS_BLOCKED_WAIT_SECONDS
}
