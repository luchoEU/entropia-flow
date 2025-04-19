import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux';
import ImgButton from './common/ImgButton';
import ModeState from '../application/state/mode';
import { getMenuPinned, getMode, getShowVisibility } from '../application/selectors/mode';
import { pinMenu, setShowSubtitles, setShowVisibleToggle } from '../application/actions/mode';
import { getClientStatus } from '../application/selectors/connection';
import { getStatusMessage } from '../application/selectors/status';
import { getAnyInventory } from '../application/selectors/last';
import { getVisible } from '../application/selectors/expandable';
import { setVisible } from '../application/actions/expandable';
import { getSettings } from '../application/selectors/settings';
import { getLocationFromTabId, getTabIdFromLocation, tabActionRequired, tabShow, tabSubtitle, tabTitle } from '../application/helpers/navigation';
import { useLocation, useNavigate } from 'react-router-dom';
import { TabId, tabOrder } from '../application/state/navigation';
import StreamView from './stream/StreamView';
import { useElementSize } from './common/useElementSize';

const Tab = (p: {
    id: TabId,
    actionRequired?: string
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const tabId = getTabIdFromLocation(location);

    const [lastVisited, setLastVisited] = useState<string | null>(null);
    const isCurrentTab = tabId === p.id;
    useEffect(() => {
        if (isCurrentTab) {
            setLastVisited(location.pathname);
        }
    }, [isCurrentTab, location.pathname]);

    const handleClick = () => {
        const fallback = getLocationFromTabId(p.id);
        const target = lastVisited ?? fallback;
        if (location.pathname !== target) {
            navigate(target);
        }
    };

    const showVisibility = useSelector(getShowVisibility);
    const visibleSelector = `tab.${p.id}`;
    const visible: boolean = useSelector(getVisible(visibleSelector));

    if (!visible && !showVisibility)
        return <></>

    return (
        <button
            className={
                (p.actionRequired ? 'warning-menu ' : '') +
                (tabId === p.id ? 'selected-menu ' : '') +
                (!visible ? 'hidden-menu ' : '') +
                'button-menu'}
            onClick={handleClick}>
            { tabTitle[p.id] }
            { p.actionRequired && <img className='img-warning-menu' src='img/warning.png' title={p.actionRequired} /> }
            { showVisibility &&
                <ImgButton title={visible ? 'click to Hide Tab' : 'click to Show Tab'}
                    className='img-visible-tab'
                    src={visible ? 'img/eyeOpen.png' : 'img/eyeClose.png'}
                    dispatch={() => setVisible(visibleSelector)(!visible)} />
            }
        </button>
    )
}

const FirstRow = () => {
    const anyInventory = useSelector(getAnyInventory)
    const status = useSelector(getClientStatus)
    const message = useSelector(getStatusMessage);
    const settings = useSelector(getSettings)
    const showVisibility = useSelector(getShowVisibility)
    const menuPinned = useSelector(getMenuPinned)

    return (
        <>
            <div>
                <img src='img/flow128.png' className='img-logo'></img>
                <strong>Entropia Flow</strong>
            </div>
            { tabOrder.map((id) => tabShow(id, anyInventory, settings) &&
                <Tab key={id} id={id} actionRequired={tabActionRequired(id, message, status)} />) }
            { showVisibility &&
                <ImgButton
                    title={`click to ${menuPinned ? 'Unpin' : 'Pin'} Menu`}
                    className='img-nav-pin'
                    src={menuPinned ? 'img/pinOn.png' : 'img/pinOff.png'}
                    dispatch={() => pinMenu(!menuPinned)} />
            }
        </>
    )
}

const Navigation = () => {
    const { showSubtitles, showVisibleToggle, menuPinned, streamViewPinned }: ModeState = useSelector(getMode)
    const tabId = getTabIdFromLocation(useLocation())
    const { ref, size: { height } } = useElementSize<HTMLElement>();

    return (
        <>
            <nav ref={ref} className={menuPinned && 'nav-pinned'}>
                { showSubtitles ?
                    <div className='nav-with-subtitle'>
                        <div className='nav-row'>
                            <FirstRow />
                        </div>
                        <div>
                            <span>{tabSubtitle[tabId]}</span>
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
                { streamViewPinned && <StreamView /> }
            </nav>
            { menuPinned && <div style={{ height }} /> }
        </>
    )
}

export default Navigation
