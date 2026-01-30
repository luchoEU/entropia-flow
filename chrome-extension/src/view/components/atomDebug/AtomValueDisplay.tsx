import React, { useState, useEffect } from 'react'
import { useAtomValue } from 'jotai'
import { AtomType } from '../../application/atoms/atomRegistry'
import { typeEmojis } from './atomTypeConstants'
import JsonTreeNode from '../rawStorage/JsonTreeNode'

interface AtomValueDisplayProps {
    atomName: string
    atom: any
    atomType: AtomType
    expandedKeys: Set<string>
    onToggleExpand: (keyPath: string) => void
}

const AtomValueDisplay: React.FC<AtomValueDisplayProps> = ({
    atomName,
    atom,
    atomType,
    expandedKeys,
    onToggleExpand
}) => {
    const [error, setError] = useState<string | null>(null)
    const [value, setValue] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    try {
        // Try to read the atom value
        const atomValue = useAtomValue(atom)

        useEffect(() => {
            setValue(atomValue)
            setError(null)
            setIsLoading(false)
        }, [atomValue])
    } catch (e) {
        useEffect(() => {
            setError(e instanceof Error ? e.message : 'Cannot read atom value')
            setIsLoading(false)
        }, [])
    }

    if (isLoading) {
        return (
            <div style={{ padding: '8px', color: '#666', fontSize: '12px' }}>
                Loading...
            </div>
        )
    }

    if (error) {
        return (
            <div style={{
                padding: '8px',
                backgroundColor: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '4px',
                fontSize: '12px',
                marginBottom: '4px'
            }}>
                <strong>{typeEmojis[atomType]} {atomName}:</strong> <span style={{ color: '#856404' }}>Write-only atom</span>
            </div>
        )
    }

    return (
        <div style={{ marginBottom: '4px' }}>
            <JsonTreeNode
                keyPath={atomName}
                nodeKey={`${typeEmojis[atomType]} ${atomName}`}
                value={value}
                depth={0}
                isExpanded={expandedKeys.has(atomName)}
                expandedKeys={expandedKeys}
                onToggleExpand={onToggleExpand}
                onEdit={() => {}} // Read-only
                onDelete={() => {}} // Read-only
            />
        </div>
    )
}

export default AtomValueDisplay
