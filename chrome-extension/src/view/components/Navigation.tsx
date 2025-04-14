import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { selectMenu, tabOrder } from '../application/actions/menu';
import { getSelectedMenu } from '../application/selectors/menu';
import ImgButton from './common/ImgButton';
import ModeState from '../application/state/mode';
import { getMode } from '../application/selectors/mode';
import { setShowSubtitles, setShowVisibleToggle } from '../application/actions/mode';
import { getConnection } from '../application/selectors/connection';
import { getStatus } from '../application/selectors/status';
import { getLast } from '../application/selectors/last';
import { getVisible } from '../application/selectors/expandable';
import { setVisible } from '../application/actions/expandable';
import { getSettings } from '../application/selectors/settings';
import { tabActionRequired, tabShow, tabSubtitle, tabTitle } from '../application/helpers/menu';

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
    const settings = useSelector(getSettings)

    return (
        <>
            <div>
                <img src='img/flow128.png' className='img-logo'></img>
                <strong>Entropia Flow</strong>
            </div>
            { tabOrder.map((id) => tabShow(id, show, settings) &&
                <Tab key={id} id={id} actionRequired={tabActionRequired(id, message, status)} />) }
        </>
    )
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
