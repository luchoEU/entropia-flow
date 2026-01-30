import React from 'react'

interface ActionNameDisplayProps {
    emoji: string
    name: string
    itemCount: number
    isEditing?: boolean
}

const ActionNameDisplay: React.FC<ActionNameDisplayProps> = ({
    emoji,
    name,
    itemCount,
    isEditing = false,
}) => {
    return (
        <span style={{ fontWeight: 'bold' }}>
            <span>{emoji} {name}</span>
            {!isEditing && itemCount > 0 && (
                <span style={{ marginLeft: '10px', fontSize: '12px', opacity: 0.7 }}>
                    ({itemCount} item{itemCount !== 1 ? 's' : ''})
                </span>
            )}
        </span>
    )
}

export default ActionNameDisplay
