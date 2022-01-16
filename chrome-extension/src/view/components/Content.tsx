import React from 'react'
import { useSelector } from 'react-redux'
import { ABOUT_PAGE, AUCTION_PAGE, INVENTORY_PAGE, STREAM_PAGE } from '../application/actions/menu'
import { getSelectedMenu } from '../application/selectors/menu'
import AboutPage from './about/AboutPage'
import AuctionPage from './auction/AuctionPage'
import InventoryPage from './inventory/InventoryPage'
import StreamPage from './stream/StreamPage'

function Content() {
    const menu = useSelector(getSelectedMenu)
    switch (menu) {
        case INVENTORY_PAGE:
            return (<InventoryPage />)
        case STREAM_PAGE:
            return (<StreamPage />)
        case AUCTION_PAGE:
            return (<AuctionPage />)
        case ABOUT_PAGE:
            return (<AboutPage />)
        default:
            return <></>
    }
}

export default Content
