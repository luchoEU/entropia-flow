import React from 'react'
import { useAtomValue } from 'jotai'
import { SessionType, StoredAction, ActivityItem, getActionTimestamp } from '../../application/state/activity'
import ImgButton from '../common/ImgButton'
import { activityAtom } from '../../application/atoms/activity'
import { getSessionActions as getSessionActionsUtil } from './activityUtils'

interface SessionMetaProps {
    sessionId: string
    sessionType: SessionType
    sessionName: string
    typeIcon: string
    isPreSession: boolean
    inventory?: {
        total: number
        items: number
    }
    showActions: 'autoActions' | 'items' | 'userActions'
    onUpdateType: (type: SessionType) => void
    onCopy: () => void
    onReinfer: () => void
    getAllItemIds: (action: StoredAction) => number[]
    buildCopyTextForAction: (action: StoredAction) => string
    buildCopyTextForItems: (items: ActivityItem[]) => string
    getInventoryItem: (id: number) => ActivityItem | undefined
}

const SessionMeta: React.FC<SessionMetaProps> = ({
    sessionId,
    sessionType,
    sessionName,
    typeIcon,
    isPreSession,
    inventory,
    showActions,
    onUpdateType,
    onCopy,
    onReinfer,
    getAllItemIds,
    buildCopyTextForAction,
    buildCopyTextForItems,
    getInventoryItem,
}) => {
    const activity = useAtomValue(activityAtom)
    const sessionActions = getSessionActionsUtil(sessionId, activity)
    return (
        <div className='session-meta'>
            <span className='session-type'>
                {typeIcon}
                <select
                    value={sessionType}
                    onChange={(e) => onUpdateType(e.target.value as SessionType)}
                    disabled={isPreSession}
                    onClick={(e) => e.stopPropagation()}
                >
                    <option value="unknown">Any</option>
                    <option value="hunt">Hunt</option>
                    <option value="mine">Mine</option>
                    <option value="craft">Craft</option>
                </select>
            </span>
            {inventory && (
                <span className='session-inventory'>
                    {inventory.total.toFixed(2)} PED ({inventory.items} items)
                </span>
            )}
            <span className='session-meta-actions'>
                {sessionActions.length > 0 && (
                    <ImgButton
                        title="Copy session to clipboard"
                        src="img/copy.png"
                        className="img-btn-copy"
                        clickPopup="Copied!"
                        dispatch={() => {
                            let text = `${sessionName}\n`
                            if (showActions === 'autoActions') {
                                sessionActions.sort((a, b) => getActionTimestamp(b, getInventoryItem) - getActionTimestamp(a, getInventoryItem)).forEach(action => {
                                    text += '\n' + buildCopyTextForAction(action)
                                })
                            } else {
                                // Get all inventory items referenced by actions in this session
                                const itemIds = new Set<number>()
                                sessionActions.forEach(action => {
                                    getAllItemIds(action).forEach(itemId => itemIds.add(itemId))
                                })
                                const items = Array.from(itemIds).map(itemId => getInventoryItem(itemId)).filter(item => item !== undefined) as ActivityItem[]
                                text = buildCopyTextForItems(items)
                            }
                            onCopy()
                        }}
                    />
                )}
                {!isPreSession && (
                    <button className='btn-reinfer' onClick={() => onReinfer()}>
                        Re-infer
                    </button>
                )}
            </span>
        </div>
    )
}

export default SessionMeta
