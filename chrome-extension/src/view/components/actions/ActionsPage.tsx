import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { StoredAction, formatActionDescription } from '../../application/state/actions'
import { ViewItemData } from '../../application/state/history'
import ItemText from '../common/ItemText'

const getActions = (state: any): StoredAction[] => state.actions.list

const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toTimeString().slice(0, 8)
}

const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toDateString()
}

const ActionRow = ({ action }: { action: StoredAction }) => {
    const [expanded, setExpanded] = useState(false)
    return (
        <>
            <tr className='item-row' onClick={() => setExpanded(!expanded)}>
                <td>
                    <span style={{ cursor: 'pointer', marginRight: '5px' }}>
                        {expanded ? '▼' : '▶'}
                    </span>
                    <span className='action-time'>{formatTime(action.timestamp)}</span>
                    {' '}
                    <ItemText text={formatActionDescription(action)} />
                </td>
                <td className='action-sources'>
                    {action.sources.join(', ')}
                </td>
            </tr>
            {expanded && action.relatedItems.map((item: ViewItemData, idx: number) => (
                <tr key={idx} className='item-row'>
                    <td style={{ paddingLeft: '40px' }}>
                        <ItemText text={item.n} />
                    </td>
                    <td>
                        {item.q && <span>{item.q} </span>}
                        {item.v && <span>{item.v} PED </span>}
                        {item.c && <span className='item-container'>{item.c}</span>}
                    </td>
                </tr>
            ))}
        </>
    )
}

const groupByDate = (actions: StoredAction[]): Map<string, StoredAction[]> => {
    const groups = new Map<string, StoredAction[]>()
    for (const action of actions) {
        const date = formatDate(action.timestamp)
        if (!groups.has(date)) {
            groups.set(date, [])
        }
        groups.get(date)!.push(action)
    }
    return groups
}

function ActionsPage() {
    const actions = useSelector(getActions)
    const groupedActions = groupByDate(actions)

    if (actions.length === 0) {
        return (
            <section>
                <p>No actions recorded yet.</p>
                <p>Actions will appear here as inventory changes are detected.</p>
            </section>
        )
    }

    return (
        <section>
            {Array.from(groupedActions.entries()).map(([date, dateActions]) => (
                <div key={date} className='actions-group'>
                    <h4 className='actions-date'>{date}</h4>
                    <table className='table-diff'>
                        <tbody>
                            {dateActions.map((action, idx) => (
                                <ActionRow key={action.id || idx} action={action} />
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </section>
    )
}

export default ActionsPage
