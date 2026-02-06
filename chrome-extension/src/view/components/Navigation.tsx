import React, { useEffect, useRef, useState } from 'react'
import { useAtomValue, useSetAtom } from 'jotai';
import ImgButton from './common/ImgButton';
import ModeState from '../application/state/mode';
import { modeAtom, setShowSubtitlesAtom, setShowVisibleToggleAtom, pinMenuAtom } from '../application/atoms/mode';
import { connectionAtom } from '../application/atoms/connection';
import { statusAtom } from '../application/atoms/status';
import { lastComputedAtom } from '../application/atoms/last';
import { budgetStateAtom } from '../application/atoms/budget';
import { expandableAtom, setVisibleAtom } from '../application/atoms/expandable';
import { settingsAtom } from '../application/atoms/settings';
import { getLocationFromTabId, getTabIdFromLocation, tabActionRequired, tabShow, tabSubtitle, tabTitle } from '../application/helpers/navigation';
import { useLocation, useNavigate } from 'react-router-dom';
import { TabId, tabOrder } from '../application/state/navigation';
import StreamView from './stream/StreamView';
import { useElementSize } from './common/useElementSize';

const Tab = (p: {
    id: TabId,
    actionRequired?: string,
    pendingCount?: number
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

    const mode = useAtomValue(modeAtom);
    const expandable = useAtomValue(expandableAtom);
    const setVisible = useSetAtom(setVisibleAtom);
    const visibleSelector = `tab.${p.id}`;
    const showVisibility = mode.showVisibleToggle;
    const visible: boolean = !expandable.hidden.includes(visibleSelector);

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
            { p.actionRequired && <img className='img-warning-menu' data-show src='img/warning.png' title={p.actionRequired} /> }
            { p.pendingCount !== undefined && p.pendingCount > 0 && (
                <span className='tab-pending-badge' title={`${p.pendingCount} pending`}>{p.pendingCount}</span>
            )}
            { showVisibility &&
                <ImgButton title={visible ? 'click to Hide Tab' : 'click to Show Tab'}
                    className='img-btn-visible-tab'
                    src={visible ? 'img/eyeOpen.png' : 'img/eyeClose.png'}
                    dispatch={() => setVisible(visibleSelector, !visible)} />
            }
        </button>
    )
}

const FirstRow = () => {
    const lastComputed = useAtomValue(lastComputedAtom)
    const anyInventory = lastComputed.anyInventory
    const connection = useAtomValue(connectionAtom)
    const status = connection.client.status
    const statusData = useAtomValue(statusAtom)
    const message = statusData.message;
    const settings = useAtomValue(settingsAtom)
    const mode = useAtomValue(modeAtom)
    const showVisibility = mode.showVisibleToggle
    const menuPinned = mode.menuPinned
    const budgetState = useAtomValue(budgetStateAtom)
    const budgetPendingCount = budgetState.list.items.filter(item => (item.pendingLines?.length ?? 0) > 0).length
    const pinMenu = useSetAtom(pinMenuAtom)

    return (
        <>
            <div>
                <img src='img/flow128.png' data-show className='img-logo'></img>
                <strong>Entropia Flow</strong>
            </div>
            { tabOrder.map((id) => tabShow(id, anyInventory, settings) &&
                <Tab
                    key={id}
                    id={id}
                    actionRequired={tabActionRequired(id, message, status)}
                    pendingCount={id === TabId.BUDGET ? budgetPendingCount : undefined}
                />) }
            { showVisibility &&
                <ImgButton
                    title={`click to ${menuPinned ? 'Unpin' : 'Pin'} Menu`}
                    className='img-btn-nav-pin'
                    src={menuPinned ? 'img/pinOn.png' : 'img/pinOff.png'}
                    dispatch={() => pinMenu(!menuPinned)} />
            }
        </>
    )
}

const Navigation = () => {
    const mode: ModeState = useAtomValue(modeAtom)
    const { showSubtitles, showVisibleToggle, menuPinned, streamViewPinned } = mode
    const setShowSubtitles = useSetAtom(setShowSubtitlesAtom)
    const setShowVisibleToggle = useSetAtom(setShowVisibleToggleAtom)
    const tabId = getTabIdFromLocation(useLocation())
    const { ref, size: { height } } = useElementSize<HTMLElement>();

    return (
        <>
            <nav ref={ref} className={'img-hover-container ' + (menuPinned ? 'nav-pinned' : '')}>
                { showSubtitles ?
                    <div className='nav-with-subtitle'>
                        <div className='nav-row'>
                            <FirstRow />
                        </div>
                        <div>
                            <span>{tabSubtitle[tabId]}</span>
                            <ImgButton title={showVisibleToggle ? 'click to Hide Section Visibility Button' : 'click to Show Section Visibility Button'}
                                className='img-btn-visible-section'
                                src={showVisibleToggle ? 'img/eyeOpen.png' : 'img/eyeClose.png'}
                                show
                                dispatch={() => setShowVisibleToggle(!showVisibleToggle)} />
                            <ImgButton title='Hide Subtitles'
                                className='img-btn-subtitles'
                                src='img/up.png'
                                show
                                dispatch={() => setShowSubtitles(false)} />
                        </div>
                    </div> :
                    <div className='nav-row img-hover-container'>
                        <FirstRow />
                        <div style={{ flex: 1 }} />
                        <ImgButton title='Show Subtitles' className='img-btn-subtitles' src='img/down.png' dispatch={() => setShowSubtitles(true)} />
                    </div>
                }
                { streamViewPinned && <StreamView /> }
            </nav>
            { menuPinned && <div style={{ height }} /> }
        </>
    )
}

export default Navigation
