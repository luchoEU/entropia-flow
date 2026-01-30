import React, { useState } from 'react'
import ImgButton from '../common/ImgButton'
import { getDeltaClass } from './activityPageUtils'
import { formatDateTime } from '../../../common/time'

interface SessionHeaderProps {
    sessionName: string
    isExpanded: boolean
    isEditing: boolean
    isPreSession: boolean
    startTime: number
    delta?: number
    onToggleExpand: () => void
    onStartEdit: () => void
    onSaveName: (name: string) => void
    onDelete: () => void
}

const SessionHeader: React.FC<SessionHeaderProps> = ({
    sessionName,
    isExpanded,
    isEditing,
    isPreSession,
    startTime,
    delta,
    onToggleExpand,
    onStartEdit,
    onSaveName,
    onDelete,
}) => {
    const [editedName, setEditedName] = useState(sessionName)

    const handleBlur = () => {
        onSaveName(editedName)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onSaveName(editedName)
        }
    }

    return (
        <div className='session-header img-hover-containerr' onClick={onToggleExpand} style={{ cursor: 'pointer' }}>
            <div className='session-header-main'>
                <span className='session-expand'>{isExpanded ? '▼' : '▶'}</span>
                {isEditing ? (
                    <input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        className='session-name-input'
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <span className='session-name'>{sessionName}</span>
                )}
                {!isPreSession && !isEditing && (
                    <>
                        <ImgButton
                            title="Edit session name"
                            src="img/edit.png"
                            className="img-btn-edit"
                            dispatch={onStartEdit}
                        />
                        <ImgButton
                            title="Delete session"
                            src="img/trash.png"
                            className="img-btn-trash-black"
                            dispatch={onDelete}
                        />
                    </>
                )}
                {delta !== undefined && (
                    <span className={`difference ${getDeltaClass(delta)}`}>
                        {delta?.toFixed(2)}
                    </span>
                )}
            </div>
            <span className='session-date'>{startTime ? formatDateTime(startTime) : ''}</span>
        </div>
    )
}

export default SessionHeader
