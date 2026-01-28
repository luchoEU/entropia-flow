import React, { useState } from 'react'
import { ViewItemData } from '../../application/state/history'
import { SortableItemsTable } from './SortableItemsTable'
import BaseActionRow from './BaseActionRow'

interface UnknownActionProps {
    items: ViewItemData[]
    timestamp: number
    onCreateAction: (emoji: string, name: string, items: ViewItemData[]) => void | Promise<void>
    isValidEmoji: (str: string) => boolean
    isExpanded: boolean
    onToggleExpand: () => void
}

const UnknownAction: React.FC<UnknownActionProps> = ({
    items,
    timestamp,
    onCreateAction,
    isValidEmoji,
    isExpanded,
    onToggleExpand,
}) => {
    const [isEditing, setIsEditing] = useState(false)
    const [editEmoji, setEditEmoji] = useState('🎯')
    const [editName, setEditName] = useState('')

    const hasValidEmoji = !editEmoji.trim() || isValidEmoji(editEmoji)
    const hasValidName = editName.trim().length > 0
    const isFormValid = hasValidName && hasValidEmoji

    const handleSave = async () => {
        if (!isFormValid) return
        await onCreateAction(editEmoji, editName, items)
        setIsEditing(false)
    }

    const handleCancel = () => {
        setIsEditing(false)
    }

    const displayEmoji = isEditing ? editEmoji : '❓'
    const displayName = isEditing ? editName : ''

    const total = 0

    const nameContent = (
        <span style={{ fontWeight: 'bold' }}>
            <span>{displayEmoji} {displayName}</span>
            { !isEditing && <span style={{ marginLeft: '10px', fontSize: '12px', opacity: 0.7 }}>({items.length} item{items.length !== 1 ? 's' : ''})</span> }
        </span>
    )

    const actionsContent = null

    return (
        <>
            <BaseActionRow
                timestamp={timestamp}
                total={total}
                isExpanded={isExpanded}
                onToggleExpand={onToggleExpand}
                isEditing={isEditing}
                onStartEdit={() => setIsEditing(true)}
                onSave={handleSave}
                onCancel={handleCancel}
                isSaveDisabled={!isFormValid}
                emoji={editEmoji}
                name={editName}
                onEmojiChange={setEditEmoji}
                onNameChange={setEditName}
                isValidEmoji={isValidEmoji}
            >
                {[nameContent, actionsContent]}
            </BaseActionRow>

            {/* Content */}
            {isExpanded && !isEditing && items.length > 0 && (
                <tr>
                    <td colSpan={5} style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                        <SortableItemsTable
                            items={items}
                            selectionMode={false}
                            selectedItemIds={new Set()}
                            onItemToggle={() => {}}
                            onSelectionChange={() => {}}
                        />
                    </td>
                </tr>
            )}

            {/* Edit validation messages */}
            {isEditing && (
                <tr>
                    <td colSpan={5} style={{ padding: '10px', borderBottom: '1px solid #ddd', backgroundColor: '#fafafa' }}>
                        {editEmoji.trim() && !hasValidEmoji && (
                            <div style={{ color: '#ff6b6b', fontSize: '12px', marginBottom: '8px' }}>
                                ⚠ Please enter a single emoji (e.g., 💰 or 🎁)
                            </div>
                        )}
                        {!hasValidName && (
                            <div style={{ color: '#ff6b6b', fontSize: '12px', marginBottom: '8px' }}>
                                ⚠ Please enter an action name
                            </div>
                        )}
                    </td>
                </tr>
            )}
        </>
    )
}

export default UnknownAction
