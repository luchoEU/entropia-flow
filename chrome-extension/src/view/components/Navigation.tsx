import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { SHOW_BUDGET_PAGE, SHOW_FEATURES_IN_DEVELOPMENT, SHOW_REFINED_PAGE, SHOW_SETTINGS_PAGE } from '../../config'
import { ABOUT_PAGE, MONITOR_PAGE, STREAM_PAGE, INVENTORY_PAGE, CRAFT_PAGE, selectMenu, TRADE_PAGE, SETTING_PAGE, REFINED_PAGE, BUDGET_PAGE, CLIENT_PAGE } from '../application/actions/menu';
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
            <Tab id={MONITOR_PAGE} title='Monitor' />
            <Tab id={INVENTORY_PAGE} title='Inventory' />
            <Tab id={TRADE_PAGE} title="Trading" />
            <Tab id={CRAFT_PAGE} title='Crafting' />
            <Tab id={CLIENT_PAGE} title='Client' />
            <Tab id={STREAM_PAGE} title='Stream' />
            { SHOW_REFINED_PAGE && <Tab id={REFINED_PAGE} title='Refined' /> }
            { SHOW_BUDGET_PAGE && <Tab id={BUDGET_PAGE} title='Budget' /> }
            { SHOW_SETTINGS_PAGE && <Tab id={SETTING_PAGE} title='Settings' /> }
            <Tab id={ABOUT_PAGE} title='About' />
        </nav>
    )
}

export default Navigation