import React, { ReactNode } from 'react'
import { formatTime } from '../../../common/time'
import ImgButton from '../common/ImgButton'

interface BaseActionRowProps {
    timestamp: number
    total: number
    isExpanded: boolean
    onToggleExpand: () => void
    isEditing?: boolean
    onStartEdit?: () => void
    onSave?: () => void
    onCancel?: () => void
    isSaveDisabled?: boolean
    editNameContent?: ReactNode
    // For emoji/name editing pattern
    emoji?: string
    name?: string
    onEmojiChange?: (emoji: string) => void
    onNameChange?: (name: string) => void
    isValidEmoji?: (emoji: string) => boolean
    children: [ReactNode, ReactNode] // [nameContent, actionsContent]
}

const BaseActionRow: React.FC<BaseActionRowProps> = ({
    timestamp,
    total,
    isExpanded,
    onToggleExpand,
    isEditing = false,
    onStartEdit,
    onSave,
    onCancel,
    isSaveDisabled = false,
    editNameContent,
    emoji,
    name,
    onEmojiChange,
    onNameChange,
    isValidEmoji,
    children,
}) => {
    const [nameContent, actionsContent] = children

    // Use provided editNameContent if available, otherwise use emoji/name pattern
    let displayNameContent = nameContent
    if (isEditing) {
        if (editNameContent) {
            displayNameContent = editNameContent
        } else if (emoji !== undefined && name !== undefined && onEmojiChange && onNameChange) {
            const hasValidEmoji = !emoji.trim() || !isValidEmoji || isValidEmoji(emoji)
            displayNameContent = (
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                    <input
                        type="text"
                        placeholder="Emoji"
                        value={emoji}
                        onChange={(e) => onEmojiChange(e.target.value)}
                        maxLength={2}
                        style={{
                            padding: '5px 8px',
                            fontSize: '14px',
                            borderColor: emoji && !hasValidEmoji ? '#ff6b6b' : 'inherit',
                            width: '3em',
                            border: '1px solid #ccc',
                            borderRadius: '3px'
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Action name"
                        value={name}
                        onChange={(e) => onNameChange(e.target.value)}
                        style={{
                            padding: '5px 8px',
                            fontSize: '14px',
                            flex: 1,
                            border: '1px solid #ccc',
                            borderRadius: '3px'
                        }}
                        autoFocus
                    />
                </div>
            )
        }
    }

    const actionsWithEdit = (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
            {isEditing && (onSave || onCancel) ? (
                <>
                    {onSave && (
                        <button
                            onClick={onSave}
                            disabled={isSaveDisabled}
                            style={{
                                padding: '4px 12px',
                                fontSize: '12px',
                                backgroundColor: isSaveDisabled ? '#ccc' : '#4CAF50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: isSaveDisabled ? 'not-allowed' : 'pointer',
                                opacity: isSaveDisabled ? 0.5 : 1
                            }}
                        >
                            Save
                        </button>
                    )}
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            style={{
                                padding: '4px 12px',
                                fontSize: '12px',
                                backgroundColor: '#999',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                    )}
                </>
            ) : (
                <>
                    {onStartEdit && (
                        <ImgButton
                            title="Edit action item"
                            src="img/edit.png"
                            dispatch={onStartEdit}
                        />
                    )}
                    {actionsContent}
                </>
            )}
        </div>
    )

    return (
        <tr className="item-row img-container-hover">
            <td>
                <span style={{ cursor: 'pointer', marginRight: '5px' }} onClick={onToggleExpand}>
                    {isExpanded ? '▼' : '▶'}
                </span>
            </td>
            <td>
                <span className="action-time">{formatTime(timestamp)}</span>
            </td>
            <td>{`${total.toFixed(2)} PED`}</td>
            <td>{displayNameContent}</td>
            <td>{actionsWithEdit}</td>
        </tr>
    )
}

export default BaseActionRow
