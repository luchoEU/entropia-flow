import React, { useState, useEffect } from 'react'
import { useAtom } from 'jotai'
import {
    getAllSyncStorage,
    getAllLocalStorage,
    setStorageValue,
    deleteStorageKey,
    clearStorage,
    getStorageInfo,
    type StorageInfo
} from '../../services/rawStorageService'
import JsonTreeViewer from './JsonTreeViewer'
import StorageEditModal from './StorageEditModal'
import { rawStoragePreferencesAtom, type SelectedStorage } from '../../application/atoms/rawStorage'

const RawStoragePage: React.FC = () => {
    const [preferences, setPreferences] = useAtom(rawStoragePreferencesAtom)
    const selectedStorage = preferences.selectedStorage
    const expandedKeys = new Set(preferences.expandedKeys)
    const searchQuery = preferences.searchQuery

    const [syncData, setSyncData] = useState<Record<string, any>>({})
    const [localData, setLocalData] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    // Edit modal state
    const [editingKey, setEditingKey] = useState<string | null>(null)
    const [editingValue, setEditingValue] = useState<any>(null)

    // Storage info
    const [syncInfo, setSyncInfo] = useState<StorageInfo | null>(null)
    const [localInfo, setLocalInfo] = useState<StorageInfo | null>(null)

    const loadAllData = async () => {
        try {
            setLoading(true)
            setError(null)

            const [syncStorage, localStorage, syncInfo, localInfo] = await Promise.all([
                getAllSyncStorage(),
                getAllLocalStorage(),
                getStorageInfo('sync'),
                getStorageInfo('local')
            ])

            setSyncData(syncStorage)
            setLocalData(localStorage)
            setSyncInfo(syncInfo)
            setLocalInfo(localInfo)
            setLoading(false)
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Failed to load storage'
            setError(message)
            setLoading(false)
        }
    }

    useEffect(() => {
        loadAllData()

        // Listen for storage changes from other tabs/windows
        const handleStorageChange = (changes: any, areaName: string) => {
            // Reload data when storage changes externally
            loadAllData()
        }

        chrome.storage.onChanged.addListener(handleStorageChange)
        return () => chrome.storage.onChanged.removeListener(handleStorageChange)
    }, [])

    const currentData = selectedStorage === 'sync' ? syncData : localData

    const handleToggleExpand = (keyPath: string) => {
        const newExpanded = new Set(preferences.expandedKeys)
        if (newExpanded.has(keyPath)) {
            newExpanded.delete(keyPath)
        } else {
            newExpanded.add(keyPath)
        }
        setPreferences(p => ({ ...p, expandedKeys: Array.from(newExpanded) }))
    }

    const handleEdit = (key: string, value: any) => {
        setEditingKey(key)
        setEditingValue(value)
    }

    const handleSaveEdit = async (key: string, value: any) => {
        try {
            setError(null)
            await setStorageValue(selectedStorage, key, value)
            setSuccess('Value saved successfully')
            setTimeout(() => setSuccess(null), 3000)
            await loadAllData()
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Failed to save'
            setError(message)
        }
    }

    const handleDelete = async (key: string) => {
        if (!confirm(`Delete "${key}"?`)) return

        try {
            setError(null)
            await deleteStorageKey(selectedStorage, key)
            setSuccess('Key deleted successfully')
            setTimeout(() => setSuccess(null), 3000)
            await loadAllData()
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Failed to delete'
            setError(message)
        }
    }

    const handleClearStorage = async () => {
        const confirmMsg = `Clear all ${selectedStorage} storage? This cannot be undone.`
        if (!confirm(confirmMsg)) return

        try {
            setError(null)
            await clearStorage(selectedStorage)
            setSuccess('Storage cleared successfully')
            setTimeout(() => setSuccess(null), 3000)
            await loadAllData()
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Failed to clear'
            setError(message)
        }
    }

    const handleExport = () => {
        const data = {
            exported: new Date().toISOString(),
            storage: selectedStorage,
            data: currentData
        }
        const json = JSON.stringify(data, null, 2)
        const blob = new Blob([json], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `storage-${selectedStorage}-${Date.now()}.json`
        a.click()
        URL.revokeObjectURL(url)
    }

    const handleRefresh = async () => {
        await loadAllData()
        setSuccess('Storage refreshed')
        setTimeout(() => setSuccess(null), 2000)
    }

    const storageInfo = selectedStorage === 'sync' ? syncInfo : localInfo

    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <p>Loading storage data...</p>
            </div>
        )
    }

    return (
        <div className="raw-storage-page">
            {/* Error Banner */}
            {error && (
                <div style={{
                    padding: '12px 16px',
                    margin: '16px',
                    backgroundColor: '#ffeef0',
                    border: '1px solid #d73a49',
                    borderRadius: '4px',
                    color: '#d73a49'
                }}>
                    {error}
                </div>
            )}

            {/* Success Banner */}
            {success && (
                <div style={{
                    padding: '12px 16px',
                    margin: '16px',
                    backgroundColor: '#f0f5f9',
                    border: '1px solid #28a745',
                    borderRadius: '4px',
                    color: '#28a745'
                }}>
                    {success}
                </div>
            )}

            {/* Storage Selector */}
            <div style={{ display: 'flex', gap: '8px', padding: '16px', borderBottom: '1px solid #e1e4e8' }}>
                {(['sync', 'local'] as const).map(storage => (
                    <button
                        key={storage}
                        onClick={() => setPreferences(p => ({ ...p, selectedStorage: storage }))}
                        style={{
                            padding: '8px 16px',
                            border: selectedStorage === storage ? '2px solid #0366d6' : '1px solid #ccc',
                            borderRadius: '4px',
                            backgroundColor: selectedStorage === storage ? '#e8f5ff' : '#f5f5f5',
                            color: selectedStorage === storage ? '#0366d6' : '#333',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }}
                    >
                        {storage === 'sync' ? '☁️ Sync Storage' : '💾 Local Storage'}
                    </button>
                ))}
            </div>

            {/* Storage Info */}
            {storageInfo && (
                <div style={{ padding: '12px 16px', backgroundColor: '#f6f8fa', fontSize: '12px', borderBottom: '1px solid #e1e4e8' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <span>
                            <strong>Usage:</strong> {(storageInfo.bytes / 1024).toFixed(1)} KB / {(storageInfo.quota / 1024).toFixed(0)} KB
                            ({storageInfo.percentUsed.toFixed(1)}%)
                        </span>
                        <span>
                            <strong>Available:</strong> {(storageInfo.available / 1024).toFixed(1)} KB
                        </span>
                    </div>
                </div>
            )}

            {/* Search Bar */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #e1e4e8' }}>
                <input
                    type="text"
                    placeholder="Search keys..."
                    value={searchQuery}
                    onChange={(e) => setPreferences(p => ({ ...p, searchQuery: e.target.value }))}
                />
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', borderBottom: '1px solid #e1e4e8' }}>
                <button onClick={handleRefresh}>
                    🔄 Refresh
                </button>
                <button onClick={handleExport}>
                    📥 Export
                </button>
                <button
                    onClick={handleClearStorage}
                    style={{ marginLeft: 'auto' }}
                >
                    🗑️ Clear All
                </button>
            </div>

            {/* JSON Tree Viewer */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <JsonTreeViewer
                    data={currentData}
                    expandedKeys={expandedKeys}
                    onToggleExpand={handleToggleExpand}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    searchQuery={searchQuery}
                />
            </div>

            {/* Edit Modal */}
            <StorageEditModal
                isVisible={editingKey !== null}
                storageKey={editingKey}
                initialValue={editingValue}
                onSave={handleSaveEdit}
                onCancel={() => {
                    setEditingKey(null)
                    setEditingValue(null)
                }}
            />
        </div>
    )
}

export default RawStoragePage
