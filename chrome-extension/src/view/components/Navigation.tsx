import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { SHOW_FEATURES_IN_DEVELOPMENT } from '../../config'
import { ABOUT_PAGE, MONITOR_PAGE, STREAM_PAGE, INVENTORY_PAGE, CRAFT_PAGE, selectMenu, TRADE_PAGE, SETTING_PAGE, REFINED_PAGE, GAME_LOG_PAGE, CONNECTION_PAGE, GAME_SPLIT_PAGE, BUDGET_PAGE } from '../application/actions/menu';
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
    return (
        <nav>
            <div>
                <img src='img/flow128.png'></img>
                <strong>Entropia Flow</strong>
            </div>
            <Tab id={MONITOR_PAGE} title="Monitor" />
            <Tab id={INVENTORY_PAGE} title='Inventory' />
            <Tab id={TRADE_PAGE} title="Trading" />
            {SHOW_FEATURES_IN_DEVELOPMENT ?
                <>
                <Tab id={REFINED_PAGE} title="Refined" />
                <Tab id={CRAFT_PAGE} title='Crafting' />
                <Tab id={BUDGET_PAGE} title='Budget' />
                <Tab id={SETTING_PAGE} title='Settings' />
                <Tab id={GAME_LOG_PAGE} title="Game Log" />
                <Tab id={GAME_SPLIT_PAGE} title="Game Split" />
                <Tab id={CONNECTION_PAGE} title='Connection' />
                </> : ''
            }
            <Tab id={STREAM_PAGE} title='Stream' />
            <Tab id={ABOUT_PAGE} title='About' />
        </nav>
    )
}

export default Navigation