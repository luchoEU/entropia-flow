import React, { useState, useMemo } from 'react'
import JsonTreeNode from './JsonTreeNode'

interface JsonTreeViewerProps {
    data: Record<string, any>
    expandedKeys: Set<string>
    onToggleExpand: (keyPath: string) => void
    onEdit: (key: string, value: any) => void
    onDelete: (key: string) => void
    searchQuery?: string
}

const JsonTreeViewer: React.FC<JsonTreeViewerProps> = ({
    data,
    expandedKeys,
    onToggleExpand,
    onEdit,
    onDelete,
    searchQuery = ''
}) => {
    const entries = Object.entries(data)

    const filteredEntries = useMemo(() => {
        if (!searchQuery.trim()) return entries

        const query = searchQuery.toLowerCase()
        return entries.filter(([key]) => key.toLowerCase().includes(query))
    }, [entries, searchQuery])

    if (filteredEntries.length === 0) {
        return (
            <div style={{ padding: '20px', color: '#999', fontFamily: 'monospace' }}>
                {entries.length === 0 ? 'No data' : 'No matches found'}
            </div>
        )
    }

    return (
        <div style={{ padding: '16px', fontFamily: 'monospace', fontSize: '12px' }}>
            {filteredEntries.map(([key, value]) => (
                <JsonTreeNode
                    key={key}
                    keyPath={key}
                    nodeKey={key}
                    value={value}
                    depth={0}
                    isExpanded={expandedKeys.has(key)}
                    onToggleExpand={onToggleExpand}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    )
}

export default JsonTreeViewer
