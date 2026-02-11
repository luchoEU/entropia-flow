import React from 'react'
import { useAtomValue } from 'jotai'
import { SessionType, StoredAction, ActivityItem, getActionTimestamp } from '../../application/state/activity'
import ImgButton from '../common/ImgButton'
import { activityAtom } from '../../application/atoms/activity'
import { getSessionActions, getSessionItems } from './activityUtils'

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
    buildCopyTextForAction: (action: StoredAction) => string
    buildCopyTextForItems: (items: ActivityItem[]) => string
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
    buildCopyTextForAction,
    buildCopyTextForItems,
}) => {
    const activity = useAtomValue(activityAtom)
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
                <ImgButton
                    title="Copy session to clipboard"
                    src="img/copy.png"
                    className="img-btn-copy"
                    clickPopup="Copied!"
                    action={() => {
                        let text = `${sessionName}\n`
                        if (showActions === 'autoActions') {
                            const sessionActions = getSessionActions(sessionId, activity)
                            sessionActions.sort((a, b) => b.timestamp - a.timestamp).forEach(action => {
                                text += '\n' + buildCopyTextForAction(action)
                            })
                        } else {
                            // Get all inventory items referenced by actions in this session
                            const sessionItems = getSessionItems(sessionId, activity)
                            text = buildCopyTextForItems(sessionItems)
                        }
                        onCopy()
                    }}
                />
                {!isPreSession && (
                    <button className='btn-reinfer' onClick={() => onReinfer()}>
                        🧠 Re-infer
                    </button>
                )}
            </span>
        </div>
    )
}

export default SessionMeta
