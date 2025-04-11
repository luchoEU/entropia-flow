import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { SHOW_BUDGET_PAGE, SHOW_REFINED_PAGE, SHOW_SETTINGS_PAGE } from '../../config'
import { ABOUT_PAGE, MONITOR_PAGE, STREAM_PAGE, INVENTORY_PAGE, CRAFT_PAGE, selectMenu, TRADE_PAGE, SETTING_PAGE, REFINED_PAGE, BUDGET_PAGE, CLIENT_PAGE, tabOrder, tabShow } from '../application/actions/menu';
import { getSelectedMenu } from '../application/selectors/menu';
import ImgButton from './common/ImgButton';
import ModeState from '../application/state/mode';
import { getMode } from '../application/selectors/mode';
import { setShowSubtitles, setShowVisibleToggle } from '../application/actions/mode';
import { getConnection } from '../application/selectors/connection';
import { STRING_PLEASE_LOG_IN } from '../../common/const';
import { getStatus } from '../application/selectors/status';
import { getLast } from '../application/selectors/last';
import { getVisible } from '../application/selectors/expandable';
import { setVisible } from '../application/actions/expandable';

const Tab = (p: {
    id: number,
    actionRequired?: string
}) => {
    const dispatch = useDispatch()
    const menu = useSelector(getSelectedMenu)
    const { showSubtitles, showVisibleToggle }: ModeState = useSelector(getMode)
    const visibleSelector = `tab.${p.id}`;
    const visible: boolean = useSelector(getVisible(visibleSelector))

    const showVisible = showSubtitles && showVisibleToggle
    if (!visible && !showVisible)
        return <></>

    return (
        <button
            className={
                (p.actionRequired ? 'warning-menu ' : '') +
                (menu === p.id ? 'selected-menu ' : '') +
                (!visible ? 'hidden-menu ' : '') +
                'button-menu'}
            onClick={() => dispatch(selectMenu(p.id))}>
            { tabTitle[p.id] }
            { p.actionRequired && <img className='img-warning-menu' src='img/warning.png' title={p.actionRequired} /> }
            { showVisible &&
                <ImgButton title={visible ? 'click to Hide Tab' : 'click to Show Tab'}
                    className='img-visible-tab'
                    src={visible ? 'img/eyeOpen.png' : 'img/eyeClose.png'}
                    dispatch={() => setVisible(visibleSelector)(!visible)} />
            }
        </button>
    )
}

const FirstRow = () => {
    const { c: { show } } = useSelector(getLast)
    const { client: { status } } = useSelector(getConnection)
    const { message } = useSelector(getStatus);

    return (
        <>
            <div>
                <img src='img/flow128.png' className='img-logo'></img>
                <strong>Entropia Flow</strong>
            </div>
            { tabOrder.map((id) => tabShow(id, show) &&
                <Tab key={id} id={id} actionRequired={tabActionRequired(id, message, status)} />) }
        </>
    )
}

const tabTitle = {
    [MONITOR_PAGE]: 'Monitor',
    [INVENTORY_PAGE]: 'Inventory',
    [TRADE_PAGE]: 'Trading',
    [CRAFT_PAGE]: 'Crafting',
    [CLIENT_PAGE]: 'Client',
    [STREAM_PAGE]: 'Stream',
    [REFINED_PAGE]: 'Refined',
    [BUDGET_PAGE]: 'Budget',
    [SETTING_PAGE]: 'Settings',
    [ABOUT_PAGE]: 'About'
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

const tabActionRequired = (id: number, message: string, status: string): string | undefined => {
    switch (id) {
        case MONITOR_PAGE: return message === STRING_PLEASE_LOG_IN ? 'Disconnected' : undefined
        case CLIENT_PAGE: return !status.startsWith('connected') && !status.startsWith('init') ? 'Disconnected' : undefined    
        default: return undefined
    }
}

const Navigation = () => {
    const { showSubtitles, showVisibleToggle }: ModeState = useSelector(getMode)
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
                        <ImgButton title={showVisibleToggle ? 'click to Hide Section Visibility Button' : 'click to Show Section Visibility Button'}
                            className='img-visible-section'
                            src={showVisibleToggle ? 'img/eyeOpen.png' : 'img/eyeClose.png'}
                            dispatch={() => setShowVisibleToggle(!showVisibleToggle)} />
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