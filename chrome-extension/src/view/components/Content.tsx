import React from 'react'
import { useSelector } from 'react-redux'
import { ABOUT_PAGE, CONNECTION_PAGE, CRAFT_PAGE, GAME_LOG_PAGE, GAME_SPLIT_PAGE, INVENTORY_PAGE, MONITOR_PAGE, REFINED_PAGE, SETTING_PAGE, STREAM_PAGE, TRADE_PAGE } from '../application/actions/menu'
import { getSelectedMenu } from '../application/selectors/menu'
import AboutPage from './about/AboutPage'
import CraftPage from './craft/CraftPage'
import InventoryPage from './inventory/InventoryPage'
import MonitorPage from './monitor/MonitorPage'
import RefinedPage from './refined/RefinedPage'
import SettingsPage from './settings/SettingsPage'
import StreamPage from './stream/StreamPage'
import StreamView from './stream/StreamView'
import TradePage from './trade/TradePage'
import GameLogPage from './log/GameLogPage'
import ConnectionPage from './connection/ConnectionPage'
import GameSplitPage from './split/GameSplitPage'

function ContentPage() {
    const menu = useSelector(getSelectedMenu)
    switch (menu) {
        case MONITOR_PAGE:
            return <MonitorPage />
        case INVENTORY_PAGE:
            return <InventoryPage />
        case STREAM_PAGE:
            return <StreamPage />
        case REFINED_PAGE:
            return <RefinedPage />
        case ABOUT_PAGE:
            return <AboutPage />
        case CRAFT_PAGE:
            return <CraftPage />
        case TRADE_PAGE:
            return <TradePage />
        case SETTING_PAGE:
            return <SettingsPage />
        case GAME_LOG_PAGE:
            return <GameLogPage />
        case CONNECTION_PAGE:
            return <ConnectionPage />
        case GAME_SPLIT_PAGE:
            return <GameSplitPage />
        default:
            return <></>
    }
}

function Content() {
    return <>
        <StreamView />
        <ContentPage />
    </>
}

export default Content
