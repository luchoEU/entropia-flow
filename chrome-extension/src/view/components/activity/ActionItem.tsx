import React from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { ActivityItem, ActivityAction, UserActionTypeDefinition } from '../../application/state/activity'
import { activityAtom, updateExpandedActionRowsAtom } from '../../application/atoms/activity'
import ItemText from '../common/ItemText'
import BaseActionRow from './BaseActionRow'
import ImgButton from '../common/ImgButton'
import InferenceRuleEditor from './InferenceRuleEditor'
import ActionNameDisplay from './ActionNameDisplay'
import { useActionEdit } from './useActionEdit'
import { calculateActionTotal } from './calculateActionTotal'

interface ActionItemProps {
    action: ActivityAction
    actionTypeDef: UserActionTypeDefinition | undefined
    onDelete: () => void
    getInventoryItem: (id: number) => ActivityItem | undefined
    getInventoryItemWithFallback?: (itemId: number, fallbackTimestamp?: number) => ActivityItem
    onSaveActionType?: (actionType: any) => Promise<void>
    isValidEmoji: (str: string) => boolean
}

const ActionItem: React.FC<ActionItemProps> = ({
    action,
    actionTypeDef,
    onDelete,
    getInventoryItem,
    getInventoryItemWithFallback,
    onSaveActionType,
    isValidEmoji,
}) => {
    const {
        isEditing,
        setIsEditing,
        editingEmoji,
        setEditingEmoji,
        editingName,
        setEditingName,
        editingRule,
        setEditingRule,
        handleStartEdit,
        handleCancelEdit,
    } = useActionEdit({
        initialEmoji: actionTypeDef?.emoji || '🎯',
        initialName: actionTypeDef?.name || '',
        initialRule: actionTypeDef?.inferenceRule,
    })

    // Jotai state management for expanded rows
    const activity = useAtomValue(activityAtom)
    const updateExpandedActionRows = useSetAtom(updateExpandedActionRowsAtom)

    const actionId = action.id || ''
    const isExpanded = activity.ui.expanded.actionRows.includes(actionId)

    const handleToggleExpand = () => {
        const newExpandedRows = [...activity.ui.expanded.actionRows]
        if (newExpandedRows.includes(actionId)) {
            newExpandedRows.splice(newExpandedRows.indexOf(actionId), 1)
        } else {
            newExpandedRows.push(actionId)
        }
        updateExpandedActionRows(newExpandedRows)
    }

    // Extract data from action object
    const timestamp = action.timestamp || 0
    const itemIds = Array.isArray(action.relatedItems.items) ? action.relatedItems.items : [action.relatedItems.items]

    // Initialize editing state when editing starts
    React.useEffect(() => {
        if (isEditing) {
            setEditingEmoji(actionTypeDef?.emoji || '🎯')
            setEditingName(actionTypeDef?.name || '')
            if (actionTypeDef?.inferenceRule) {
                setEditingRule(JSON.parse(JSON.stringify(actionTypeDef.inferenceRule)))
            }
        } else {
            setEditingRule(null)
        }
    }, [isEditing, actionTypeDef])

    const handleSaveActionType = async () => {
        if (!editingName.trim() || !isValidEmoji(editingEmoji)) return

        // If the type definition changed, save the updated definition
        const ruleChanged = editingRule && JSON.stringify(editingRule) !== JSON.stringify(actionTypeDef?.inferenceRule)
        if (actionTypeDef && (editingEmoji !== actionTypeDef.emoji || editingName !== actionTypeDef.name || ruleChanged)) {
            if (onSaveActionType) {
                const updatedType = {
                    ...actionTypeDef,
                    emoji: editingEmoji,
                    name: editingName,
                    inferenceRule: editingRule
                }
                await onSaveActionType(updatedType)
            }
        }
        setIsEditing(false)
    }

    const handleRuleChange = (updatedRule: any) => {
        setEditingRule(updatedRule)
    }

    // Calculate total value
    const total = calculateActionTotal(itemIds, getInventoryItem)

    const normalNameContent = actionTypeDef ? (
        <ActionNameDisplay
            emoji={actionTypeDef.emoji}
            name={actionTypeDef.name}
            itemCount={itemIds.length}
            isEditing={isEditing}
        />
    ) : (
        <span style={{ fontWeight: 'bold' }}>Unknown type</span>
    )

    const actionsContent = (
        <div key="actions">
            <ImgButton
                title="Delete action"
                src={'img/trash.png'}
                className='img-btn-trash-black'
                dispatch={onDelete}
            />
        </div>
    )

    return (
        <>
            <BaseActionRow
                timestamp={timestamp}
                total={total}
                isExpanded={isExpanded}
                onToggleExpand={handleToggleExpand}
                isEditing={isEditing}
                onStartEdit={handleStartEdit}
                onSave={handleSaveActionType}
                onCancel={handleCancelEdit}
                emoji={editingEmoji}
                name={editingName}
                onEmojiChange={setEditingEmoji}
                onNameChange={setEditingName}
                isValidEmoji={isValidEmoji}
            >
                {[normalNameContent, actionsContent]}
            </BaseActionRow>
            {isExpanded && (
                <tr>
                    <td colSpan={5} style={{ paddingLeft: '40px' }}>
                        {isEditing && editingRule ? (
                            <InferenceRuleEditor
                                ruleData={editingRule}
                                items={itemIds}
                                getInventoryItem={getInventoryItem}
                                onRuleChange={handleRuleChange}
                            />
                        ) : itemIds.length > 0 ? (
                            <table className='table-diff' style={{ borderBottom: '1px solid #ddd' }}>
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Quantity</th>
                                        <th>Value</th>
                                        <th>Container</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {itemIds.map((itemId: number, idx: number) => {
                                        const item = getInventoryItemWithFallback ? getInventoryItemWithFallback(itemId, timestamp) : getInventoryItem(itemId)
                                        if (!item) return null
                                        return (
                                            <tr key={idx}>
                                                <td><ItemText text={item.name} /></td>
                                                <td>{item.quantity} </td>
                                                <td>{(item.value ?? 0).toFixed(2)} PED</td>
                                                <td>{item.container}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        ) : null}
                    </td>
                </tr>
            )}
        </>
    )
}

export default ActionItem
