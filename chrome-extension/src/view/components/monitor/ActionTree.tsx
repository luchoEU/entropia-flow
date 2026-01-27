import React, { useState } from 'react'
import { InferredAction } from '../../application/state/activity'
import { ViewItemData } from '../../application/state/history'
import ItemText from '../common/ItemText'
import { formatActionDescription } from '../../application/state/activity'

const ActionRow = ({ action }: { action: InferredAction }) => {
    const [expanded, setExpanded] = useState(false)

    // Helper to extract all item IDs from relatedItems structure
    const getAllItemIds = (action: InferredAction): number[] => {
        const values = Object.values(action.relatedItems)
        const ids: number[] = []
        for (const value of values) {
            if (typeof value === 'number') {
                ids.push(value)
            } else if (Array.isArray(value)) {
                ids.push(...value)
            }
        }
        return ids
    }

    // Fallback function for missing inventory items (monitor doesn't have full state)
    const getInventoryItemFallback = (id: number) => ({
        id,
        name: 'unknown',
        quantity: 0,
        value: 0,
        container: 'unknown',
        timestamp: Date.now(),
        source: 'inventory' as const
    })

    const itemIds = getAllItemIds(action)

    return (
        <>
            <tr className='item-row' onClick={() => setExpanded(!expanded)}>
                <td>
                    <span style={{ cursor: 'pointer', marginRight: '5px' }}>
                        {expanded ? '▼' : '▶'}
                    </span>
                    <ItemText text={formatActionDescription(action as any, getInventoryItemFallback)} />
                </td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
            {expanded && itemIds.map((itemId: number, idx: number) => {
                const item = getInventoryItemFallback(itemId)
                return (
                    <tr key={idx} className='item-row'>
                        <td style={{ paddingLeft: '20px' }}>
                            <ItemText text={item.name} />
                        </td>
                        <td>
                            <ItemText text={item.quantity.toString()} />
                        </td>
                        <td>
                            <ItemText text={item.value.toFixed(2) + ' PED'} />
                        </td>
                        <td>
                            <ItemText text={item.container} />
                        </td>
                    </tr>
                )
            })}
        </>
    )
}

const ActionTree = ({ actions }: { actions: InferredAction[] }) => {
    return (
        <table className='table-diff'>
            <tbody>
                {actions.map((action, idx) => (
                    <ActionRow key={idx} action={action} />
                ))}
            </tbody>
        </table>
    )
}

export default ActionTree
