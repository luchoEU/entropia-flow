import React from 'react'
import { useAtomValue } from 'jotai'
import { loadable } from 'jotai/utils'
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
    // Use loadable to safely handle atoms that might throw or be write-only
    const loadableAtom = React.useMemo(() => loadable(atom), [atom])
    const state = useAtomValue(loadableAtom)

    if (state.state === 'loading') {
        return (
            <div style={{ padding: '8px', color: '#666', fontSize: '12px' }}>
                Loading...
            </div>
        )
    }

    if (state.state === 'hasError') {
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

    const value = state.state === 'hasData' ? state.data : null

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
