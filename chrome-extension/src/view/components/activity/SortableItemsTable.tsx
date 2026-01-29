import React, { useState } from 'react'
import { SessionType } from '../../application/state/activity'
import { ViewItemData } from '../../application/state/history'
import ItemText from '../common/ItemText'
import ImgButton from '../common/ImgButton'

type SortColumn = 'n' | 'q' | 'v' | 'c' | 't' | 's'
type SortDirection = 'asc' | 'desc'

interface ItemExclusionConfig {
    sessionId: string
    sessionType: SessionType
    sessionBlacklist: string[]
    permanentBlacklist: string[]
    onExclude: (itemName: string) => void
    onInclude: (itemName: string) => void
    onPermanentExclude: (itemName: string, value: boolean) => void
}

const SortableItemsTable = ({ items, exclusionConfig, selectionMode = false, selectedItemIds = new Set(), onItemToggle, showSelectAll = true, onSelectionChange }: { items: ViewItemData[], exclusionConfig?: ItemExclusionConfig, selectionMode?: boolean, selectedItemIds?: Set<number>, onItemToggle?: (itemId: number) => void, showSelectAll?: boolean, onSelectionChange?: (selectedIds: Set<number>) => void }) => {
    const [sortColumn, setSortColumn] = useState<SortColumn>('v')
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

    const handleSort = (column: SortColumn) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortColumn(column)
            setSortDirection('asc')
        }
    }

    const sortedItems = [...items].sort((a, b) => {
        const aVal = a[sortColumn]
        const bVal = b[sortColumn]
        let compare: number
        if (sortColumn === 'q' || sortColumn === 'v') {
            compare = Math.abs(parseFloat(String(aVal)) || 0) - Math.abs(parseFloat(String(bVal)) || 0)
        } else if (sortColumn === 't') {
            compare = new Date(aVal || 0).getTime() - new Date(bVal || 0).getTime()
        } else {
            compare = String(aVal || '').localeCompare(String(bVal || ''))
        }
        return sortDirection === 'asc' ? compare : -compare
    })

    const SortHeader = ({ column, label }: { column: SortColumn, label: string }) => (
        <th onClick={() => handleSort(column)} style={{ cursor: 'pointer' }}>
            {label}
            {sortColumn === column && (
                <img src={sortDirection === 'asc' ? 'img/up.png' : 'img/down.png'} className="img-sort" style={{ marginLeft: '4px' }} />
            )}
        </th>
    )

    const isExcluded = (itemName: string) => exclusionConfig?.sessionBlacklist?.includes(itemName) ?? false
    const isPermanentlyExcluded = (itemName: string) => exclusionConfig?.permanentBlacklist?.includes(itemName) ?? false

    const handleSelectAll = (selectAll: boolean) => {
        const newSet = new Set(selectedItemIds)

        if (selectAll) {
            // Select all items in this table
            sortedItems.forEach(item => {
                newSet.add(item.key)
            })
        } else {
            // Deselect all items in this table
            sortedItems.forEach(item => {
                newSet.delete(item.key)
            })
        }

        // Batch update via parent callback
        if (onSelectionChange) {
            onSelectionChange(newSet)
        } else if (onItemToggle) {
            // Fallback to individual toggles if no batch callback
            sortedItems.forEach(item => {
                if (selectAll && !selectedItemIds.has(item.key)) {
                    onItemToggle(item.key)
                } else if (!selectAll && selectedItemIds.has(item.key)) {
                    onItemToggle(item.key)
                }
            })
        }
    }

    return (
        <table key={`${sortColumn}-${sortDirection}`} className='table-diff'>
            <thead>
                <tr>
                    {selectionMode && showSelectAll && <th><input type="checkbox" onChange={(e) => handleSelectAll(e.target.checked)} checked={sortedItems.length > 0 && sortedItems.every(item => selectedItemIds.has(item.key))} /></th>}
                    <SortHeader column='t' label='Time' />
                    <SortHeader column='n' label='Item' />
                    {exclusionConfig && <th></th>}
                    <SortHeader column='q' label='Quantity' />
                    <SortHeader column='v' label='Value' />
                    <SortHeader column='c' label='Container' />
                    <SortHeader column='s' label='Source' />
                </tr>
            </thead>
            <tbody>
                {sortedItems.map((item) => {
                    const excluded = isExcluded(item.n)
                    const permanent = isPermanentlyExcluded(item.n)
                    const isExcludedOrPermanent = excluded || permanent
                    return (
                        <tr key={item.key} className={isExcludedOrPermanent ? 'item-row-excluded' : ''}>
                            {selectionMode && (
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedItemIds.has(item.key)}
                                        onChange={() => onItemToggle?.(item.key)}
                                    />
                                </td>
                            )}
                            <td style={{ textAlign: 'left' }}>{item.t ? new Date(item.t).toLocaleString() : '-'}</td>
                            <td><ItemText text={item.n} /></td>
                            {exclusionConfig && (
                                <td>
                                    {permanent ? (
                                        <ImgButton
                                            title='Remove permanent exclusion from the sum'
                                            src='img/forbidden.png'
                                            show
                                            dispatch={() => exclusionConfig.onPermanentExclude(item.n, false)}
                                        />
                                    ) : excluded ? (
                                        <>
                                            <ImgButton
                                                title='Include this item in the sum'
                                                src='img/cross.png'
                                                show
                                                dispatch={() => exclusionConfig.onInclude(item.n)}
                                            />
                                            <ImgButton
                                                title='Permanently exclude this item from the sum'
                                                src='img/forbidden.png'
                                                dispatch={() => exclusionConfig.onPermanentExclude(item.n, true)}
                                            />
                                        </>
                                    ) : (
                                        <ImgButton
                                            title='Exclude this item from the sum'
                                            src='img/cross.png'
                                            dispatch={() => exclusionConfig.onExclude(item.n)}
                                        />
                                    )}
                                </td>
                            )}
                            <td style={{ textAlign: 'right' }}>{item.q}</td>
                            <td style={{ textAlign: 'right' }}>{item.v} PED</td>
                            <td style={{ textAlign: 'left' }}>{item.c}</td>
                            <td style={{ textAlign: 'left' }}>{item.s || '-'}</td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
    )
}

export { SortableItemsTable, ItemExclusionConfig }
