import React from 'react'
import { useSelector } from 'react-redux'
import { ABOUT_PAGE, AUCTION_PAGE, CRAFT_PAGE, INVENTORY_PAGE, MONITOR_PAGE, STREAM_PAGE, TRADE_PAGE } from '../application/actions/menu'
import { getSelectedMenu } from '../application/selectors/menu'
import AboutPage from './about/AboutPage'
import AuctionPage from './auction/AuctionPage'
import CraftPage from './craft/CraftPage'
import InventoryPage from './inventory/InventoryPage'
import MonitorPage from './monitor/MonitorPage'
import StreamPage from './stream/StreamPage'
import TradePage from './trade/TradePage'

function Content() {
    const menu = useSelector(getSelectedMenu)
    switch (menu) {
        case MONITOR_PAGE:
            return (<MonitorPage />)
        case INVENTORY_PAGE:
            return (<InventoryPage />)
        case STREAM_PAGE:
            return (<StreamPage />)
        case AUCTION_PAGE:
            return (<AuctionPage />)
        case ABOUT_PAGE:
            return (<AboutPage />)
        case CRAFT_PAGE:
            return (<CraftPage />)
        case TRADE_PAGE:
            return (<TradePage />)
        default:
            return <></>
    }
}

export default Content
