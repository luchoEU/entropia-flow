import React from 'react'

interface UserActionFormProps {
    selectedItemsCount: number
    emoji: string
    name: string
    onEmojiChange: (emoji: string) => void
    onNameChange: (name: string) => void
    onCreate: () => void
    isValidEmoji: (str: string) => boolean
}

const UserActionForm: React.FC<UserActionFormProps> = ({
    selectedItemsCount,
    emoji,
    name,
    onEmojiChange,
    onNameChange,
    onCreate,
    isValidEmoji,
}) => {
    const hasValidEmoji = !emoji.trim() || isValidEmoji(emoji)
    const hasValidName = name.trim().length > 0
    const isFormValid = selectedItemsCount > 0 && hasValidName && hasValidEmoji

    return (
        <div className='create-user-action-form' style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '13px' }}>
                    Create Action from {selectedItemsCount} selected item(s)
                </label>

                {/* Emoji input with validation */}
                <input
                    type="text"
                    placeholder="Emoji"
                    value={emoji}
                    onChange={(e) => onEmojiChange(e.target.value)}
                    maxLength={2}
                    style={{
                        margin: '5px 5px 5px 0',
                        padding: '5px 10px',
                        fontSize: '14px',
                        borderColor: emoji && !hasValidEmoji ? '#ff6b6b' : 'inherit',
                        width: '3em'
                    }}
                    title="Enter a single emoji or leave empty to use default 🎯"
                />

                {/* Action name input */}
                <input
                    type="text"
                    placeholder="Action name (e.g., 'Sold to Trader')"
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                    style={{ margin: '5px 5px 5px 0', padding: '5px 10px', fontSize: '14px' }}
                />

                {/* Validation error messages */}
                {selectedItemsCount === 0 && (
                    <div style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '8px', marginBottom: '8px' }}>
                        ⚠ Please select at least one item
                    </div>
                )}
                {emoji.trim() && !hasValidEmoji && (
                    <div style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '8px', marginBottom: '8px' }}>
                        ⚠ Please enter a single emoji (e.g., 💰 or 🎁)
                    </div>
                )}
                {!hasValidName && (
                    <div style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '8px', marginBottom: '8px' }}>
                        ⚠ Please enter an action name
                    </div>
                )}

                {/* Create button */}
                <button
                    onClick={onCreate}
                    disabled={!isFormValid}
                    style={{
                        margin: '5px 5px 5px 0',
                        padding: '5px 15px',
                        cursor: isFormValid ? 'pointer' : 'not-allowed',
                        opacity: isFormValid ? 1 : 0.5
                    }}
                >
                    ⚙️ Create Action
                </button>
            </div>
        </div>
    )
}

export default UserActionForm
