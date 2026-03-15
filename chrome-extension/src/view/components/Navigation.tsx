import React, { useEffect, useRef, useState } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import ImgButton from './common/ImgButton';
import ModeState from '../application/state/mode';
import { modeAtom, setShowSubtitlesAtom, setShowVisibleToggleAtom, pinMenuAtom } from '../application/atoms/mode';
import { connectionAtom } from '../application/atoms/connection';
import { statusAtom } from '../application/atoms/status';
import { lastComputedAtom } from '../application/atoms/last';
import { budgetStateAtom } from '../application/atoms/budget';
import { expandableAtom, setVisibleAtom } from '../application/atoms/expandable';
import { settingsAtom } from '../application/atoms/settings';
import { lastVisitedByTabAtom, tabOrderAtom } from '../application/atoms/navigation';
import { getLocationFromTabId, getTabIdFromLocation, tabActionRequired, tabShowForRole, tabSubtitle, tabTitle } from '../application/helpers/navigation';
import { useLocation, useNavigate } from 'react-router-dom';
import { TabId } from '../application/state/navigation';
import { Role, ROLE_LABELS } from '../application/state/role';
import { roleAtom, setRoleAtom } from '../application/atoms/role';
import StreamView from './stream/StreamView';
import PinnedAtomsView from './atomDebug/PinnedAtomsView';
import { useElementSize } from './common/useElementSize';
import ItemSyncStatus from './item/ItemSyncStatus';
import { STRING_CONNECTING } from '../../common/const';
import { dashboardStatusCollapsedAtom } from './dashboard/HunterDashboard';

const Tab = (p: {
    id: TabId,
    actionRequired?: string,
    pendingCount?: number
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const tabId = getTabIdFromLocation(location);

    const [lastVisitedMap, setLastVisitedMap] = useAtom(lastVisitedByTabAtom);
    const lastVisited = lastVisitedMap[p.id] || null;
    const isCurrentTab = tabId === p.id;

    useEffect(() => {
        if (isCurrentTab) {
            setLastVisitedMap(prev => ({ ...prev, [p.id]: location.pathname }));
        }
    }, [isCurrentTab, location.pathname, p.id, setLastVisitedMap]);

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
                    action={() => setVisible(visibleSelector, !visible)} />
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
    const role = useAtomValue(roleAtom)
    const setRole = useSetAtom(setRoleAtom)
    const navigate = useNavigate()
    const location = useLocation()
    const pinMenu = useSetAtom(pinMenuAtom)
    const [tabOrder, setTabOrder] = useAtom(tabOrderAtom)
    const [draggedTab, setDraggedTab] = useState<TabId | null>(null)
    const [dropTarget, setDropTarget] = useState<TabId | null>(null)

    const handleDragStart = (id: TabId) => {
        setDraggedTab(id)
    }

    const handleDragOver = (e: React.DragEvent, id: TabId) => {
        e.preventDefault()
        if (draggedTab && draggedTab !== id) {
            setDropTarget(id)
        }
    }

    const handleDragEnter = (id: TabId) => {
        if (draggedTab && draggedTab !== id) {
            setDropTarget(id)
        }
    }

    const handleDragLeave = () => {
        setDropTarget(null)
    }

    const handleDrop = (targetId: TabId) => {
        if (!draggedTab || draggedTab === targetId) {
            setDraggedTab(null)
            setDropTarget(null)
            return
        }

        const draggedIndex = tabOrder.indexOf(draggedTab)
        const targetIndex = tabOrder.indexOf(targetId)

        const newOrder = [...tabOrder]
        newOrder.splice(draggedIndex, 1)

        // Adjust target index if dragging from left to right
        const adjustedTargetIndex = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex
        newOrder.splice(adjustedTargetIndex, 0, draggedTab)

        setTabOrder(newOrder)
        setDraggedTab(null)
        setDropTarget(null)
    }

    const isAdvanced = role === Role.ADVANCED
    const [statusCollapsed, setStatusCollapsed] = useAtom(dashboardStatusCollapsedAtom)
    const statusData2 = useAtomValue(statusAtom)
    const connection2 = useAtomValue(connectionAtom)
    const itemsOk = statusData2.class !== 'error' && statusData2.message !== STRING_CONNECTING
    const clientOk = connection2.client.status.includes('connected') && !connection2.client.status.includes('not connected') && !connection2.client.status.includes('disconnected')

    return (
        <>
            <div>
                <img src='img/flow128.png' data-show className='img-logo'></img>
                <strong>Entropia Flow</strong>
            </div>
            { isAdvanced ? (
                <select
                    className='role-selector'
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                >
                    {Object.values(Role).map(r => (
                        <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                    ))}
                </select>
            ) : (
                <>
                    <span className='role-label'>🎯 Hunter</span>
                    <button
                        className='role-switch-btn'
                        onClick={() => setRole(Role.ADVANCED)}
                        title='Switch to Advanced mode'
                    >
                        ⚙️ Advanced
                    </button>
                </>
            )}
            { isAdvanced && tabOrder.map((id) => tabShowForRole(id, role, anyInventory, settings) &&
                <div
                    key={id}
                    draggable
                    onDragStart={() => handleDragStart(id)}
                    onDragOver={(e) => handleDragOver(e, id)}
                    onDragEnter={() => handleDragEnter(id)}
                    onDragLeave={handleDragLeave}
                    onDrop={() => handleDrop(id)}
                    style={{
                        cursor: draggedTab === id ? 'grabbing' : 'grab',
                        borderLeft: dropTarget === id ? '3px solid #4a9eff' : 'none',
                        paddingLeft: dropTarget === id ? '6px' : '0px',
                        opacity: draggedTab === id ? 0.5 : 1,
                        transition: 'all 0.1s ease'
                    }}
                >
                    <Tab
                        id={id}
                        actionRequired={tabActionRequired(id, message, status)}
                        pendingCount={id === TabId.BUDGET ? budgetPendingCount : undefined}
                    />
                </div>
            ) }
            { isAdvanced && showVisibility &&
                <ImgButton
                    title={`click to ${menuPinned ? 'Unpin' : 'Pin'} Menu`}
                    className='img-btn-nav-pin'
                    src={menuPinned ? 'img/pinOn.png' : 'img/pinOff.png'}
                    action={() => pinMenu(!menuPinned)} />
            }
            { !isAdvanced && statusCollapsed && <>
                <div style={{ flex: 1 }} />
                <div className='dashboard-status-compact' onClick={() => setStatusCollapsed(false)}
                     title='Click to expand connection status'>
                    <span className={`dashboard-connection-dot-sm ${itemsOk ? 'dashboard-connection-dot-green' : 'dashboard-connection-dot-red'}`} />
                    <span className='dashboard-status-compact-label'>IT</span>
                    <span className={`dashboard-connection-dot-sm ${clientOk ? 'dashboard-connection-dot-green' : 'dashboard-connection-dot-red'}`} />
                    <span className='dashboard-status-compact-label'>CL</span>
                </div>
            </>}
        </>
    )
}

const Navigation = () => {
    const mode: ModeState = useAtomValue(modeAtom)
    const { showSubtitles, showVisibleToggle, menuPinned, streamViewPinned } = mode
    const setShowSubtitles = useSetAtom(setShowSubtitlesAtom)
    const setShowVisibleToggle = useSetAtom(setShowVisibleToggleAtom)
    const tabId = getTabIdFromLocation(useLocation())
    const role = useAtomValue(roleAtom)
    const isAdvanced = role === Role.ADVANCED
    const { ref, size: { height } } = useElementSize<HTMLElement>();

    return (
        <>
            <nav ref={ref} className={'img-hover-container ' + (menuPinned ? 'nav-pinned' : '')}>
                { isAdvanced && showSubtitles ?
                    <div className='nav-with-subtitle'>
                        <div className='nav-row'>
                            <FirstRow />
                        </div>
                        <div>
                            <span>{tabSubtitle[tabId]}</span>
                            <ItemSyncStatus />
                            <ImgButton title={showVisibleToggle ? 'click to Hide Section Visibility Button' : 'click to Show Section Visibility Button'}
                                className='img-btn-visible-section'
                                src={showVisibleToggle ? 'img/eyeOpen.png' : 'img/eyeClose.png'}
                                show
                                action={() => setShowVisibleToggle(!showVisibleToggle)} />
                            <ImgButton title='Hide Subtitles'
                                className='img-btn-subtitles'
                                src='img/up.png'
                                show
                                action={() => setShowSubtitles(false)} />
                        </div>
                    </div> :
                    <div className='nav-row img-hover-container'>
                        <FirstRow />
                        { isAdvanced && <>
                            <div style={{ flex: 1 }} />
                            <ImgButton title='Show Subtitles' className='img-btn-subtitles' src='img/down.png' action={() => setShowSubtitles(true)} />
                        </>}
                    </div>
                }
                { isAdvanced && <PinnedAtomsView /> }
                { isAdvanced && streamViewPinned && <StreamView /> }
            </nav>
            { menuPinned && <div style={{ height }} /> }
        </>
    )
}

export default Navigation
