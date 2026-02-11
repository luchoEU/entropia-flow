import React, { ReactNode } from 'react'
import { formatTime } from '../../../common/time'
import ImgButton from '../common/ImgButton'
import { suggestEmojiForAction } from '../../../common/emojiSuggester'

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
                        onChange={(e) => {
                            const newName = e.target.value
                            onNameChange(newName)
                            // Auto-suggest emoji based on action name
                            if (onEmojiChange && newName.trim()) {
                                const suggestedEmoji = suggestEmojiForAction(newName)
                                if (suggestedEmoji) {
                                    onEmojiChange(suggestedEmoji)
                                }
                            }
                        }}
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
                            className="start"
                        >
                            ✅ Save
                        </button>
                    )}
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="stop"
                        >
                            ❌ Cancel
                        </button>
                    )}
                </>
            ) : (
                <>
                    {onStartEdit && (
                        <ImgButton
                            title="Edit action item"
                            src="img/edit.png"
                            action={onStartEdit}
                        />
                    )}
                    {actionsContent}
                </>
            )}
        </div>
    )

    return (
        <tr className="item-row img-hover-container">
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
