import React from 'react'

interface DashboardSectionProps {
    title: string
    total: string
    count: number
    countLabel: string
    expanded: boolean
    onToggle: () => void
    actions?: React.ReactNode
    children: React.ReactNode
}

const DashboardSection = ({ title, total, count, countLabel, expanded, onToggle, actions, children }: DashboardSectionProps) => (
    <div className='dashboard-card dashboard-section'>
        <div className='dashboard-section-header' onClick={onToggle}>
            <div className='dashboard-section-title-block'>
                <span className='dashboard-section-title'>
                    {title} {total} {!expanded && `(${count})`} {expanded ? '▴' : '▾'}
                </span>
                {expanded && (
                    <span className='dashboard-section-subtitle'>({count} {countLabel})</span>
                )}
            </div>
            {expanded && actions && (
                <span className='dashboard-section-actions' onClick={e => e.stopPropagation()}>
                    {actions}
                </span>
            )}
        </div>
        {expanded && children}
    </div>
)

export default DashboardSection
