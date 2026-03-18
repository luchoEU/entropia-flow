import React from 'react'
import { useAtomValue } from 'jotai'
import AboutPage from './about/AboutPage'
import CraftPage from './craft/CraftPage'
import InventoryPage from './inventory/InventoryPage'
import { MonitorPage } from './monitor/MonitorPage'
import RefinedPage from './refined/RefinedPage'
import SettingsPage from './settings/SettingsPage'
import StreamPage from './stream/StreamPage'
import StreamView from './stream/StreamView'
import { TradePage } from './trade/TradePage'
import BudgetPage from './budget/BudgetPage'
import ClientPage from './client/ClientPage'
import ActivityPage from './activity/ActivityPage'
import RawStoragePage from './rawStorage/RawStoragePage'
import AtomDebugPage from './atomDebug/AtomDebugPage'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { TabId } from '../application/state/navigation'
import { settingsAtom } from '../application/atoms/settings'
import { lastComputedAtom } from '../application/atoms/last'
import { expandableAtom } from '../application/atoms/expandable'
import { modeAtom } from '../application/atoms/mode'
import { roleAtom } from '../application/atoms/role'
import { Role } from '../application/state/role'
import StreamTrashPage from './stream/StreamTrashPage'
import HunterDashboard from './dashboard/HunterDashboard'
import StorageDashboard from './dashboard/StorageDashboard'
import { tabShowForRole } from '../application/helpers/navigation'

function ContentPage() {
    const lastComputed = useAtomValue(lastComputedAtom)
    const anyInventory = lastComputed.anyInventory
    const settings = useAtomValue(settingsAtom)
    const expandable = useAtomValue(expandableAtom)
    const mode = useAtomValue(modeAtom)
    const role = useAtomValue(roleAtom)
    const showVisibility = mode.showVisibleToggle
    const isTabVisible = (id: TabId) => !expandable.hidden.includes(`tab.${id}`)

    const isAdvanced = role === Role.ADVANCED

    const tabs: { id: TabId, routes: { path: string, component: React.ComponentType }[] }[] = [
        { id: TabId.MONITOR, routes: [
            ...(isAdvanced ? [{ path: "/", component: MonitorPage }] : []),
            { path: TabId.MONITOR, component: MonitorPage }
        ] },
        { id: TabId.INVENTORY, routes: [ { path: TabId.INVENTORY, component: InventoryPage } ] },
        { id: TabId.REFINED, routes: [ { path: TabId.REFINED, component: RefinedPage } ] },
        { id: TabId.TRADE, routes: [ { path: TabId.TRADE, component: TradePage } ] },
        { id: TabId.CRAFT, routes: [
            { path: TabId.CRAFT, component: CraftPage },
            { path: `${TabId.CRAFT}/:bpName`, component: CraftPage }
        ] },
        { id: TabId.BUDGET, routes: [
            { path: `${TabId.BUDGET}/:itemName/:materialName`, component: BudgetPage },
            { path: `${TabId.BUDGET}/:itemName`, component: BudgetPage },
            { path: TabId.BUDGET, component: BudgetPage }
        ] },
        { id: TabId.ACTIVITY, routes: [ { path: TabId.ACTIVITY, component: ActivityPage } ] },
        { id: TabId.STREAM, routes: [
            { path: TabId.STREAM, component: StreamPage },
            { path: `${TabId.STREAM}/layout/:layoutId`, component: StreamPage },
            { path: `${TabId.STREAM}/trash`, component: StreamTrashPage }
        ] },
        { id: TabId.CLIENT, routes: [ { path: TabId.CLIENT, component: ClientPage } ] },
        { id: TabId.SETTING, routes: [ { path: TabId.SETTING, component: SettingsPage } ] },
        { id: TabId.RAW_STORAGE, routes: [ { path: TabId.RAW_STORAGE, component: RawStoragePage } ] },
        { id: TabId.ATOM_DEBUG, routes: [ { path: TabId.ATOM_DEBUG, component: AtomDebugPage } ] },
        { id: TabId.ABOUT, routes: [ { path: TabId.ABOUT, component: AboutPage } ] }
    ]

    return (
        <Routes>
            {!isAdvanced && <>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardRouter role={role} />} />
            </>}
            {isAdvanced && <Route path="/dashboard" element={<Navigate to="/" replace />} />}
            {tabs.map((tab) => tabShowForRole(tab.id, role, anyInventory, settings) && tab.routes.map((route) =>
                <Route key={route.path} path={route.path} element={
                    showVisibility || isTabVisible(tab.id) ? <route.component /> : <Navigate to={isAdvanced ? TabId.MONITOR : '/dashboard'} />}
                />))
            }
            <Route path="*" element={isAdvanced ? <NotFoundPage /> : <Navigate to="/dashboard" replace />} />
        </Routes>
    )
}

function DashboardRouter({ role }: { role: Role }) {
    switch (role) {
        case Role.STORAGE:
            return <StorageDashboard />
        case Role.HUNTER:
        default:
            return <HunterDashboard />
    }
}

const NotFoundPage = () => {
    return (
        <section>
            <h3>Page Not Found</h3>
            <p><Link to="/">Go to Monitor</Link></p>
        </section>
    )
}

export function Content() {
    const mode = useAtomValue(modeAtom)
    const role = useAtomValue(roleAtom)
    const streamViewPinned = mode.streamViewPinned
    const isAdvanced = role === Role.ADVANCED
    return (
        <>
            {isAdvanced && !streamViewPinned && <StreamView />}
            <ContentPage />
        </>
    )
}
