import React from 'react'
import { ViewItemData } from '../../application/state/history'
import { SortableItemsTable } from './SortableItemsTable'
import BaseActionRow from './BaseActionRow'
import ActionNameDisplay from './ActionNameDisplay'
import { useActionEdit } from './useActionEdit'
import { calculateViewItemsTotal } from './calculateActionTotal'

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
    const {
        isEditing,
        setIsEditing,
        editingEmoji,
        setEditingEmoji,
        editingName,
        setEditingName,
        handleStartEdit,
        handleCancelEdit,
    } = useActionEdit({
        initialEmoji: '🎯',
        initialName: '',
    })

    const hasValidEmoji = !editingEmoji.trim() || isValidEmoji(editingEmoji)
    const hasValidName = editingName.trim().length > 0
    const isFormValid = hasValidName && hasValidEmoji

    const handleSave = async () => {
        if (!isFormValid) return
        await onCreateAction(editingEmoji, editingName, items)
        setIsEditing(false)
    }

    const total = calculateViewItemsTotal(items)

    const nameContent = (
        <ActionNameDisplay
            emoji={isEditing ? editingEmoji : '❓'}
            name={isEditing ? editingName : ''}
            itemCount={items.length}
            isEditing={isEditing}
        />
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
                onStartEdit={handleStartEdit}
                onSave={handleSave}
                onCancel={handleCancelEdit}
                isSaveDisabled={!isFormValid}
                emoji={editingEmoji}
                name={editingName}
                onEmojiChange={setEditingEmoji}
                onNameChange={setEditingName}
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
                        {editingEmoji.trim() && !hasValidEmoji && (
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
