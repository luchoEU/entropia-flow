
import React from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { tradeItemDetailsSectionsAtom } from '../../application/atoms/inventory'

type SectionKey = 'basicInfo' | 'ttInventory' | 'itemUsage' | 'inventoryMaterials'

interface CollapsibleTradeItemDetailsSectionProps {
    title: string
    sectionKey: SectionKey
    children: React.ReactNode
    loadingIndicator?: React.ReactNode
    reloadButton?: React.ReactNode
}

export const CollapsibleTradeItemDetailsSection = ({ title, sectionKey, children, loadingIndicator, reloadButton }: CollapsibleTradeItemDetailsSectionProps) => {
    const sections = useAtomValue(tradeItemDetailsSectionsAtom)
    const setSections = useSetAtom(tradeItemDetailsSectionsAtom)
    const isExpanded = sections[sectionKey as keyof typeof sections]

    return (
        <>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    cursor: 'pointer',
                    marginTop: '12px',
                    borderBottom: '1px solid #ddd'
                }}
                onClick={() => setSections({ ...sections, [sectionKey]: !isExpanded })}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2em', transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }}>▼</span>
                    <h3 style={{ margin: 0, fontSize: '1em' }}>{title}</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                    {loadingIndicator}
                    {isExpanded && reloadButton}
                </div>
            </div>
            {isExpanded && <div style={{ marginTop: '8px' }}>{children}</div>}
        </>
    )
}
