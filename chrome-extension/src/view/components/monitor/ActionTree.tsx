import React, { useState } from 'react'
import { InferredAction } from '../../application/state/actions'
import { ViewItemData } from '../../application/state/history'
import ItemText from '../common/ItemText'
import { formatActionDescription } from '../../application/state/actions'

const ActionRow = ({ action }: { action: InferredAction }) => {
    const [expanded, setExpanded] = useState(false)
    return (
        <>
            <tr className='item-row' onClick={() => setExpanded(!expanded)}>
                <td>
                    <span style={{ cursor: 'pointer', marginRight: '5px' }}>
                        {expanded ? '▼' : '▶'}
                    </span>
                    <ItemText text={formatActionDescription(action)} />
                </td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
            {expanded && action.relatedItems.map((item: ViewItemData, idx: number) => (
                <tr key={idx} className='item-row'>
                    <td style={{ paddingLeft: '20px' }}>
                        <ItemText text={item.n} />
                    </td>
                    <td>
                        <ItemText text={item.q} />
                    </td>
                    <td>
                        <ItemText text={item.v ? item.v + ' PED' : ''} />
                    </td>
                    <td>
                        <ItemText text={item.c} />
                    </td>
                </tr>
            ))}
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
