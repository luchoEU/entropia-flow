import React, { useState, useEffect } from 'react'
import { tryDecompress, isCompressed } from '../../services/rawStorageService'

interface StorageEditModalProps {
    isVisible: boolean
    storageKey: string | null
    initialValue: any
    onSave: (key: string, value: any) => Promise<void>
    onCancel: () => void
}

const StorageEditModal: React.FC<StorageEditModalProps> = ({
    isVisible,
    storageKey,
    initialValue,
    onSave,
    onCancel
}) => {
    const [jsonText, setJsonText] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [wasCompressed, setWasCompressed] = useState(false)

    useEffect(() => {
        if (isVisible && storageKey && initialValue !== undefined) {
            const wasComp = isCompressed(initialValue)
            const valueToDisplay = wasComp ? tryDecompress(initialValue) : initialValue
            setWasCompressed(wasComp)
            setJsonText(JSON.stringify(valueToDisplay, null, 2))
            setError(null)
        }
    }, [isVisible, storageKey, initialValue])

    const handleSave = async () => {
        try {
            setError(null)
            const parsed = JSON.parse(jsonText)

            if (!storageKey) return

            setIsSaving(true)
            await onSave(storageKey, parsed)
            setIsSaving(false)
            onCancel()
        } catch (e) {
            if (e instanceof Error) {
                setError(`Invalid JSON: ${e.message}`)
            } else {
                setError('Invalid JSON format')
            }
        }
    }

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onCancel()
        }
    }

    if (!isVisible) return null

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000
            }}
            onClick={handleBackdropClick}
        >
            <div
                style={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    maxWidth: '600px',
                    width: '90%',
                    maxHeight: '80vh',
                    display: 'flex',
                    flexDirection: 'column'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ padding: '20px', borderBottom: '1px solid #e1e4e8' }}>
                    <h3 style={{ margin: 0, fontSize: '16px' }}>
                        Edit: {storageKey}
                        {wasCompressed && <span style={{ color: '#999', fontSize: '12px', marginLeft: '8px' }}>[was compressed]</span>}
                    </h3>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                    <textarea
                        value={jsonText}
                        onChange={(e) => {
                            setJsonText(e.target.value)
                            setError(null)
                        }}
                        style={{
                            width: '100%',
                            height: '300px',
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            padding: '8px',
                            border: '1px solid #e1e4e8',
                            borderRadius: '4px',
                            resize: 'vertical',
                            boxSizing: 'border-box'
                        }}
                    />
                    {error && (
                        <div
                            style={{
                                marginTop: '12px',
                                padding: '12px',
                                backgroundColor: '#ffeef0',
                                border: '1px solid #d73a49',
                                borderRadius: '4px',
                                color: '#d73a49',
                                fontSize: '12px'
                            }}
                        >
                            {error}
                        </div>
                    )}
                </div>

                <div style={{ padding: '16px', borderTop: '1px solid #e1e4e8', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onCancel}
                        disabled={isSaving}
                        style={{
                            padding: '8px 16px',
                            border: '1px solid #e1e4e8',
                            borderRadius: '4px',
                            backgroundColor: '#f6f8fa',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        style={{
                            padding: '8px 16px',
                            border: 'none',
                            borderRadius: '4px',
                            backgroundColor: '#28a745',
                            color: '#fff',
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                            fontSize: '12px',
                            opacity: isSaving ? 0.6 : 1
                        }}
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default StorageEditModal
