import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { SHOW_BUDGET_PAGE, SHOW_FEATURES_IN_DEVELOPMENT, SHOW_REFINED_PAGE, SHOW_SETTINGS_PAGE } from '../../config'
import { ABOUT_PAGE, MONITOR_PAGE, STREAM_PAGE, INVENTORY_PAGE, CRAFT_PAGE, selectMenu, TRADE_PAGE, SETTING_PAGE, REFINED_PAGE, BUDGET_PAGE, CLIENT_PAGE } from '../application/actions/menu';
import { getSelectedMenu } from '../application/selectors/menu';
import ImgButton from './common/ImgButton';
import ModeState from '../application/state/mode';
import { getMode } from '../application/selectors/mode';
import { setShowSubtitles } from '../application/actions/mode';

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

const FirstRow = () => {
    return (
        <>
            <div>
                <img src='img/flow128.png' className='img-logo'></img>
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
        </>
    )
}

const tabSubtitle = {
    [MONITOR_PAGE]: 'Monitor your Items from Entropia Universe site',
    [INVENTORY_PAGE]: 'Search and organize your Inventory',
    [TRADE_PAGE]: 'Trading hub to use for Auction and with other Players',
    [CRAFT_PAGE]: 'Crafting information center, all you need to know about your blueprints',
    [CLIENT_PAGE]: 'Connect with Entropia Flow Client and see your Game Log',
    [STREAM_PAGE]: 'Create and configure windows to your game information',
    [REFINED_PAGE]: 'Calculators for refined materials',
    [BUDGET_PAGE]: 'Budget your different activities',
    [SETTING_PAGE]: 'Settings for Entropia Flow',
    [ABOUT_PAGE]: 'Information about Entropia Flow'
}

const Navigation = () => {
    const { showSubtitles }: ModeState = useSelector(getMode)
    const menu = useSelector(getSelectedMenu)

    return (
        <nav>
            { showSubtitles ?
                <div className='nav-with-subtitle'>
                    <div className='nav-row'>
                        <FirstRow />
                    </div>
                    <div>
                        <span>{tabSubtitle[menu]}</span>
                        <ImgButton title='Hide Subtitles' className='img-subtitles' src='img/up.png' dispatch={() => setShowSubtitles(false)} />
                    </div>
                </div> :
                <div className='nav-row'>
                    <FirstRow />
                    <div style={{ flex: 1 }} />
                    <ImgButton title='Show Subtitles' className='img-subtitles' src='img/down.png' dispatch={() => setShowSubtitles(true)} />
                </div>
            }
        </nav>
    )
}

export default Navigation