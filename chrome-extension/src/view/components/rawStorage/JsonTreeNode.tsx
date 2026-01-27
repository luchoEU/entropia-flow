import React from 'react'
import { tryDecompress, isCompressed } from '../../services/rawStorageService'

interface JsonTreeNodeProps {
    keyPath: string
    nodeKey: string
    value: any
    depth: number
    isExpanded: boolean
    onToggleExpand: (keyPath: string) => void
    onEdit: (key: string, value: any) => void
    onDelete: (key: string) => void
}

const getValueType = (value: any): string => {
    if (value === null) return 'null'
    if (Array.isArray(value)) return 'array'
    return typeof value
}

const getValuePreview = (value: any): string => {
    const type = getValueType(value)

    if (type === 'string') {
        return value.length > 50 ? `"${value.substring(0, 47)}..."` : `"${value}"`
    }
    if (type === 'number') return value.toString()
    if (type === 'boolean') return value.toString()
    if (type === 'null') return 'null'
    if (type === 'array') return `[${value.length}]`
    if (type === 'object') {
        const keys = Object.keys(value)
        return `{${keys.length}}`
    }
    return value.toString()
}

const getValueColor = (type: string): string => {
    switch (type) {
        case 'string':
            return '#22863a' // green
        case 'number':
            return '#005cc5' // blue
        case 'boolean':
            return '#d73a49' // red
        case 'null':
            return '#6f42c1' // purple
        default:
            return '#000'
    }
}

const JsonTreeNode: React.FC<JsonTreeNodeProps> = ({
    keyPath,
    nodeKey,
    value,
    depth,
    isExpanded,
    onToggleExpand,
    onEdit,
    onDelete
}) => {
    const type = getValueType(value)
    const isExpandable = type === 'object' || type === 'array'
    const decompressedValue = tryDecompress(value)
    const wasCompressed = isCompressed(value) && decompressedValue !== value

    const renderPrimitive = () => {
        const color = getValueColor(type)
        return (
            <span style={{ color }}>
                {getValuePreview(wasCompressed ? decompressedValue : value)}
            </span>
        )
    }

    const renderChildren = () => {
        if (!isExpanded) return null

        const data = wasCompressed ? decompressedValue : value
        const entries = type === 'array'
            ? data.map((item: any, index: number) => [index.toString(), item])
            : Object.entries(data)

        return (
            <div style={{ paddingLeft: '20px' }}>
                {entries.map(([childKey, childValue]: any, index) => (
                    <JsonTreeNode
                        key={`${keyPath}.${childKey}`}
                        keyPath={`${keyPath}.${childKey}`}
                        nodeKey={childKey}
                        value={childValue}
                        depth={depth + 1}
                        isExpanded={false}
                        onToggleExpand={onToggleExpand}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        )
    }

    const handleCopyValue = () => {
        const valueToCopy = wasCompressed ? decompressedValue : value
        navigator.clipboard.writeText(JSON.stringify(valueToCopy, null, 2))
    }

    return (
        <div style={{ marginBottom: '4px', fontFamily: 'monospace', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isExpandable && (
                    <span
                        style={{
                            cursor: 'pointer',
                            userSelect: 'none',
                            display: 'inline-block',
                            width: '16px'
                        }}
                        onClick={() => onToggleExpand(keyPath)}
                    >
                        {isExpanded ? '▼' : '▶'}
                    </span>
                )}
                {!isExpandable && <span style={{ display: 'inline-block', width: '16px' }}></span>}

                <span style={{ color: '#666', minWidth: '150px' }}>
                    <strong>{nodeKey}:</strong>
                </span>

                {!isExpandable ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                        {renderPrimitive()}
                        {wasCompressed && <span style={{ color: '#999', fontSize: '10px' }}>[compressed]</span>}
                        <button
                            onClick={() => onEdit(nodeKey, value)}
                            style={{
                                padding: '2px 6px',
                                fontSize: '11px',
                                cursor: 'pointer',
                                marginLeft: 'auto'
                            }}
                        >
                            Edit
                        </button>
                        <button
                            onClick={handleCopyValue}
                            style={{
                                padding: '2px 6px',
                                fontSize: '11px',
                                cursor: 'pointer'
                            }}
                        >
                            Copy
                        </button>
                        {depth === 0 && (
                            <button
                                onClick={() => onDelete(nodeKey)}
                                style={{
                                    padding: '2px 6px',
                                    fontSize: '11px',
                                    cursor: 'pointer',
                                    color: '#d73a49'
                                }}
                            >
                                Delete
                            </button>
                        )}
                    </div>
                ) : (
                    <span style={{ color: '#666' }}>
                        {type === 'array' ? `Array(${value.length})` : `Object(${Object.keys(value).length})`}
                    </span>
                )}
            </div>

            {renderChildren()}
        </div>
    )
}

export default JsonTreeNode
