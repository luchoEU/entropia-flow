import { useState } from 'react'

interface UseActionEditOptions {
    initialEmoji?: string
    initialName?: string
    initialRule?: any
}

export const useActionEdit = ({
    initialEmoji = '🎯',
    initialName = '',
    initialRule,
}: UseActionEditOptions = {}) => {
    const [isEditing, setIsEditing] = useState(false)
    const [editingEmoji, setEditingEmoji] = useState(initialEmoji)
    const [editingName, setEditingName] = useState(initialName)
    const [editingRule, setEditingRule] = useState(initialRule || null)

    const handleStartEdit = () => {
        setIsEditing(true)
    }

    const handleCancelEdit = () => {
        setEditingEmoji(initialEmoji)
        setEditingName(initialName)
        setEditingRule(initialRule)
        setIsEditing(false)
    }

    const updateInitialValues = (emoji: string, name: string, rule?: any) => {
        setEditingEmoji(emoji)
        setEditingName(name)
        if (rule !== undefined) {
            setEditingRule(rule)
        }
    }

    return {
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
        updateInitialValues,
    }
}
