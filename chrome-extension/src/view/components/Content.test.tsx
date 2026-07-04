import React from 'react'
import { describe, expect, it, jest } from '@jest/globals'
import { renderToStaticMarkup } from 'react-dom/server.node'
import { Role } from '../application/state/role'

jest.mock('./dashboard/HunterDashboard', () => ({ __esModule: true, default: () => React.createElement('div', null, 'Hunter') }))
jest.mock('./dashboard/FishingDashboard', () => ({ __esModule: true, default: () => React.createElement('div', null, 'Fishing') }))
jest.mock('./dashboard/TraderDashboard', () => ({ __esModule: true, default: () => React.createElement('div', null, 'Trader') }))
jest.mock('./dashboard/CollectorDashboard', () => ({ __esModule: true, default: () => React.createElement('div', null, 'Collector') }))

import DashboardRouter from './DashboardRouter'

describe('DashboardRouter', () => {
    it('should route fishing role to the fishing dashboard', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const element = <DashboardRouter role={Role.FISHING} />

        // ============================================================================
        // ACT
        // ============================================================================
        const html = renderToStaticMarkup(element)

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(html).toContain('Fishing')
    })
})
