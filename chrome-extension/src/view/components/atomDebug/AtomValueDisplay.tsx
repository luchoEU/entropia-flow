import React from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { loadable } from 'jotai/utils'
import { AtomType } from '../../application/atoms/atomRegistry'
import { typeEmojis } from './atomTypeConstants'
import JsonTreeNode from '../rawStorage/JsonTreeNode'
import { pinnedAtomsAtom, toggleAtomPinnedAtom } from '../../application/atoms/debug'
import { isFeatureEnabledAtom } from '../../application/atoms/settings'
import { Feature } from '../../application/state/settings'
import ImgButton from '../common/ImgButton'

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
    // Validate atom before attempting to use it
    if (!atom || typeof atom !== 'object' || (!('read' in atom) && !('write' in atom) && !('init' in atom))) {
        return (
            <div style={{
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px'
            }}>
                <div style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: '#f8d7da',
                    border: '1px solid #f5c6cb',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#721c24'
                }}>
                    <strong>❌ {atomName}:</strong> Invalid atom object (not a valid Jotai atom)
                </div>
            </div>
        )
    }

    // Use loadable to safely handle atoms that might throw or be write-only
    const loadableAtom = React.useMemo(() => loadable(atom), [atom])
    const state = useAtomValue(loadableAtom)

    // Pin feature state
    const pinnedAtoms = useAtomValue(pinnedAtomsAtom)
    const togglePin = useSetAtom(toggleAtomPinnedAtom)
    const isPinned = pinnedAtoms.list.includes(atomName)

    const renderPinButton = () => {
        return (
            <ImgButton
                title={isPinned ? 'Unpin atom' : 'Pin atom'}
                src={isPinned ? 'img/pinOn.png' : 'img/pinOff.png'}
                show={true}
                dispatch={() => {
                    togglePin(atomName)
                    return true
                }}
            />
        )
    }

    if (state.state === 'loading') {
        return (
            <div style={{
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <div style={{ flex: 1, padding: '8px', color: '#666', fontSize: '12px' }}>
                    Loading...
                </div>
                {renderPinButton()}
            </div>
        )
    }

    if (state.state === 'hasError') {
        return (
            <div style={{
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px'
            }}>
                <div style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: '4px',
                    fontSize: '12px'
                }}>
                    <strong>{typeEmojis[atomType]} {atomName}:</strong> <span style={{ color: '#856404' }}>Write-only atom</span>
                </div>
                {renderPinButton()}
            </div>
        )
    }

    const value = state.state === 'hasData' ? state.data : null

    return (
        <div style={{
            marginBottom: '4px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
        }}>
            <div style={{ flex: 1 }}>
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
            {renderPinButton()}
        </div>
    )
}

export default AtomValueDisplay
