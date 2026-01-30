import React, { useState } from 'react'
import { AtomMetadata, AtomType } from '../../application/atoms/atomRegistry'
import { typeLabels, typeDescriptions, typeColors, typeEmojis } from './atomTypeConstants'
import AtomValueDisplay from './AtomValueDisplay'

interface AtomModuleSectionProps {
    moduleName: string
    atoms: AtomMetadata[]
}

const AtomModuleSection: React.FC<AtomModuleSectionProps> = ({
    moduleName,
    atoms
}) => {
    const [expandedTypes, setExpandedTypes] = useState<Set<AtomType>>(new Set(['state', 'loading']))
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())

    const toggleType = (type: AtomType) => {
        const newSet = new Set(expandedTypes)
        if (newSet.has(type)) {
            newSet.delete(type)
        } else {
            newSet.add(type)
        }
        setExpandedTypes(newSet)
    }

    const toggleExpand = (keyPath: string) => {
        const newSet = new Set(expandedKeys)
        if (newSet.has(keyPath)) {
            newSet.delete(keyPath)
        } else {
            newSet.add(keyPath)
        }
        setExpandedKeys(newSet)
    }

    const atomsByType = {
        state: atoms.filter(a => a.type === 'state'),
        computed: atoms.filter(a => a.type === 'computed'),
        loading: atoms.filter(a => a.type === 'loading'),
        action: atoms.filter(a => a.type === 'action')
    }

    return (
        <div style={{ marginBottom: '24px', border: '1px solid #e1e4e8', borderRadius: '6px', overflow: 'hidden' }}>
            <h2 style={{
                padding: '12px 16px',
                backgroundColor: '#f6f8fa',
                borderBottom: '1px solid #e1e4e8',
                margin: 0,
                fontSize: '16px',
                fontWeight: 600
            }}>
                {moduleName} Module <span style={{ color: '#666', fontWeight: 'normal' }}>({atoms.length} atoms)</span>
            </h2>

            {(['state', 'computed', 'loading', 'action'] as AtomType[]).map(type => {
                const typeAtoms = atomsByType[type]
                if (typeAtoms.length === 0) return null

                const isExpanded = expandedTypes.has(type)
                const color = typeColors[type]

                return (
                    <div key={type} style={{ borderBottom: '1px solid #e1e4e8' }}>
                        <div
                            onClick={() => toggleType(type)}
                            style={{
                                padding: '10px 16px',
                                backgroundColor: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '13px',
                                fontWeight: 600,
                                userSelect: 'none',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f6f8fa'
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLDivElement).style.backgroundColor = '#fff'
                            }}
                        >
                            <span style={{ color, fontSize: '12px' }}>
                                {isExpanded ? '▼' : '▶'}
                            </span>
                            <span style={{ color, fontSize: '14px' }} title={typeDescriptions[type]}>
                                {typeEmojis[type]}
                            </span>
                            <span style={{ color }}>
                                {typeLabels[type]}
                            </span>
                            <span style={{
                                backgroundColor: `${color}20`,
                                color: color,
                                padding: '2px 6px',
                                borderRadius: '3px',
                                fontSize: '11px',
                                fontWeight: 'bold'
                            }}>
                                {typeAtoms.length}
                            </span>
                            <span style={{
                                fontSize: '11px',
                                color: '#666',
                                fontWeight: 'normal',
                                marginLeft: 'auto'
                            }}>
                                {typeDescriptions[type]}
                            </span>
                        </div>

                        {isExpanded && (
                            <div style={{ padding: '8px 16px', backgroundColor: '#fafbfc' }}>
                                {type === 'action' ? (
                                    // For action atoms, just list them (can't read values)
                                    <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#333' }}>
                                        {typeAtoms.map((atomMeta, index) => (
                                            <div
                                                key={atomMeta.name}
                                                style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '3px',
                                                    backgroundColor: index % 2 === 0 ? 'transparent' : '#f0f2f5'
                                                }}
                                            >
                                                {typeEmojis[type]} • {atomMeta.name}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    // For readable atoms, display their values
                                    <div>
                                        {typeAtoms.map(atomMeta => (
                                            <AtomValueDisplay
                                                key={atomMeta.name}
                                                atomName={atomMeta.name}
                                                atom={atomMeta.atom}
                                                atomType={atomMeta.type}
                                                expandedKeys={expandedKeys}
                                                onToggleExpand={toggleExpand}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export default AtomModuleSection
