import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { ABOUT_PAGE, AUCTION_PAGE, MONITOR_PAGE, STREAM_PAGE, INVENTORY_PAGE, CRAFT_PAGE, selectMenu, TRADE_PAGE, SETTING_PAGE, REFINED_PAGE } from '../application/actions/menu';
import { getSelectedMenu } from '../application/selectors/menu';

const Tab = (p: {
    id: number,
    title: string
}) => {
    const dispatch = useDispatch()
    const menu = useSelector(getSelectedMenu)

    return (
        <button
            className={menu === p.id ? 'selected-menu' : ''}
            onClick={() => dispatch(selectMenu(p.id))}>
            {p.title}
        </button>
    )
}

const Navigation = () => {
    const dispatch = useDispatch()
    const menu = useSelector(getSelectedMenu)

    return (
        <nav>
            <div>
                <img src='img/flow128.png'></img>
                <strong>Entropia Flow</strong>
            </div>
            <Tab id={MONITOR_PAGE} title="Monitor" />
            <Tab id={TRADE_PAGE} title="Trading" />
            <Tab id={AUCTION_PAGE} title="Auction" />
            <Tab id={REFINED_PAGE} title="Refined" />
            <Tab id={INVENTORY_PAGE} title='Inventory' />
            <Tab id={CRAFT_PAGE} title='Crafting' />
            <Tab id={STREAM_PAGE} title='Stream' />
            <Tab id={SETTING_PAGE} title='Settings' />
            <Tab id={ABOUT_PAGE} title='About' />
        </nav>
    )
}

export default Navigation