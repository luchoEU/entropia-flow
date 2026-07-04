import React from 'react'
import { Role } from '../application/state/role'
import HunterDashboard from './dashboard/HunterDashboard'
import FishingDashboard from './dashboard/FishingDashboard'
import TraderDashboard from './dashboard/TraderDashboard'
import CollectorDashboard from './dashboard/CollectorDashboard'

function DashboardRouter({ role }: { role: Role }) {
    switch (role) {
        case Role.FISHING:
            return <FishingDashboard />
        case Role.TRADER:
            return <TraderDashboard />
        case Role.COLLECTOR:
            return <CollectorDashboard />
        case Role.HUNTER:
        default:
            return <HunterDashboard />
    }
}

export default DashboardRouter
