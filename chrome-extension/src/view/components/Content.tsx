import React from 'react'
import AboutPage from './about/AboutPage'
import CraftPage from './craft/CraftPage'
import InventoryPage from './inventory/InventoryPage'
import MonitorPage from './monitor/MonitorPage'
import RefinedPage from './refined/RefinedPage'
import SettingsPage from './settings/SettingsPage'
import StreamPage from './stream/StreamPage'
import StreamView from './stream/StreamView'
import TradePage from './trade/TradePage'
import BudgetPage from './budget/BudgetPage'
import ClientPage from './client/ClientPage'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { TabId } from '../application/state/navigation'
import { useSelector } from 'react-redux'
import { getVisibleByExpandable } from '../application/selectors/expandable'
import { tabShow } from '../application/helpers/navigation'
import { getSettings } from '../application/selectors/settings'
import { getAnyInventory } from '../application/selectors/last'
import { getExpandable } from '../application/selectors/expandable'
import { getShowVisibility, getStreamViewPinned } from '../application/selectors/mode'
import StreamTrashPage from './stream/StreamTrashPage'

function ContentPage() {
    const anyInventory = useSelector(getAnyInventory)
    const settings = useSelector(getSettings)
    const expandable = useSelector(getExpandable)
    const showVisibility = useSelector(getShowVisibility);
    const isTabVisible = (id: TabId) => getVisibleByExpandable(expandable, `tab.${id}`)

    const tabs: { id: TabId, routes: { path: string, component: React.ComponentType }[] }[] = [
        { id: TabId.MONITOR, routes: [
            { path: "/", component: MonitorPage },
            { path: TabId.MONITOR, component: MonitorPage }
        ] },
        { id: TabId.INVENTORY, routes: [ { path: TabId.INVENTORY, component: InventoryPage } ] },
        { id: TabId.REFINED, routes: [ { path: TabId.REFINED, component: RefinedPage } ] },
        { id: TabId.TRADE, routes: [ { path: TabId.TRADE, component: TradePage } ] },
        { id: TabId.CRAFT, routes: [
            { path: TabId.CRAFT, component: CraftPage },
            { path: `${TabId.CRAFT}/:bpName`, component: CraftPage }
        ] },
        { id: TabId.BUDGET, routes: [ { path: TabId.BUDGET, component: BudgetPage } ] },
        { id: TabId.STREAM, routes: [
            { path: TabId.STREAM, component: StreamPage },
            { path: `${TabId.STREAM}/layout/:layoutId`, component: StreamPage },
            { path: `${TabId.STREAM}/trash`, component: StreamTrashPage }
        ] },
        { id: TabId.CLIENT, routes: [ { path: TabId.CLIENT, component: ClientPage } ] },
        { id: TabId.SETTING, routes: [ { path: TabId.SETTING, component: SettingsPage } ] },
        { id: TabId.ABOUT, routes: [ { path: TabId.ABOUT, component: AboutPage } ] }
    ]

    return (
        <Routes>
            {tabs.map((tab) => tabShow(tab.id, anyInventory, settings) && tab.routes.map((route) =>
                <Route key={route.path} path={route.path} element={
                    showVisibility || isTabVisible(tab.id) ? <route.component /> : <Navigate to={TabId.MONITOR} />}
                />))
            }
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    )
}

const NotFoundPage = () => {
    return (
        <section>
            <h3>Page Not Found</h3>
            <p><Link to="/">Go to Monitor</Link></p>
        </section>
    )
}

function Content() {
    const streamViewPinned = useSelector(getStreamViewPinned);
    return (
        <>
            {!streamViewPinned && <StreamView />}
            <ContentPage />
        </>
    )
}

export default Content
