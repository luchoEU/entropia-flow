import React, { useMemo, useCallback } from 'react'
import { atom } from 'jotai'
import { useAtomValue, useSetAtom } from 'jotai'
import { InventoryByStore, TreeLineData } from '../../application/state/inventory'
import { JotaiSortableTableSection } from '../common/jotai/JotaiSortableTableSection'
import { CellElement } from '../common/jotai/cellDSL'
import {
  setByStoreItemExpandedAtom, setByStoreItemExpandedOnFilterAtom, setByStoreItemNameAtom,
  confirmByStoreItemNameEditingAtom, cancelByStoreItemNameEditingAtom, startByStoreItemNameEditingAtom,
  setByStoreItemStaredAtom,
  setByStoreStaredItemExpandedAtom, setByStoreStaredItemStaredAtom,
  setByStoreStaredItemNameAtom, cancelByStoreStaredItemNameEditingAtom, startByStoreStaredItemNameEditingAtom,
  confirmByStoreStaredItemNameEditingAtom,
  setByStoreAllItemsExpandedSimpleAtom, setByStoreAllItemsExpandedOnFilterAtom, setByStoreStaredAllItemsExpandedAtom,
  byStoreStateAtom, byStoreFilterAtom,
  sortByStoreByAtom, sortByStoreStaredByAtom,
  setByStoreInventoryFilterAtom, setByStoreStaredInventoryFilterAtom
} from '../../application/atoms/inventory'
import { columnIndexToSortType } from '../../application/helpers/inventory.sort'

const InventoryByStoreList = () => {
    const inv: InventoryByStore | null = useAtomValue(byStoreStateAtom)

    // Jotai read atoms
    const byStoreFilter = useAtomValue(byStoreFilterAtom)

    // Jotai write atoms
    const setByStoreItemExpanded = useSetAtom(setByStoreItemExpandedAtom)
    const setByStoreItemExpandedOnFilter = useSetAtom(setByStoreItemExpandedOnFilterAtom)
    const setByStoreItemName = useSetAtom(setByStoreItemNameAtom)
    const startByStoreItemEdit = useSetAtom(startByStoreItemNameEditingAtom)
    const confirmByStoreItemEdit = useSetAtom(confirmByStoreItemNameEditingAtom)
    const cancelByStoreItemEdit = useSetAtom(cancelByStoreItemNameEditingAtom)
    const setByStoreItemStared = useSetAtom(setByStoreItemStaredAtom)
    const setByStoreStaredItemExpanded = useSetAtom(setByStoreStaredItemExpandedAtom)
    const setByStoreStaredItemStared = useSetAtom(setByStoreStaredItemStaredAtom)
    const setByStoreStaredItemName = useSetAtom(setByStoreStaredItemNameAtom)
    const startByStoreStaredItemEdit = useSetAtom(startByStoreStaredItemNameEditingAtom)
    const confirmByStoreStaredItemEdit = useSetAtom(confirmByStoreStaredItemNameEditingAtom)
    const cancelByStoreStaredItemEdit = useSetAtom(cancelByStoreStaredItemNameEditingAtom)
    const setByStoreAllItemsExpanded = useSetAtom(setByStoreAllItemsExpandedSimpleAtom)
    const setByStoreAllItemsExpandedOnFilter = useSetAtom(setByStoreAllItemsExpandedOnFilterAtom)
    const setByStoreStaredAllItemsExpanded = useSetAtom(setByStoreStaredAllItemsExpandedAtom)
    const sortByStoreBy = useSetAtom(sortByStoreByAtom)
    const sortByStoreStaredBy = useSetAtom(sortByStoreStaredByAtom)
    const setByStoreInventoryFilter = useSetAtom(setByStoreInventoryFilterAtom)
    const setByStoreStaredInventoryFilter = useSetAtom(setByStoreStaredInventoryFilterAtom)

    // Sort handlers for tree-aware sorting
    const handleSortContainers = useCallback((columnIndex: number, ascending: boolean) => {
        const sortType = columnIndexToSortType(columnIndex, ascending)
        sortByStoreBy(sortType)
    }, [sortByStoreBy])

    const handleSortStared = useCallback((columnIndex: number, ascending: boolean) => {
        const sortType = columnIndexToSortType(columnIndex, ascending)
        sortByStoreStaredBy(sortType)
    }, [sortByStoreStaredBy])

    // Filter handlers for tree-aware filtering
    const handleFilterContainers = useCallback((filter: string) => {
        setByStoreInventoryFilter(filter)
    }, [setByStoreInventoryFilter])

    const handleFilterStared = useCallback((filter: string) => {
        setByStoreStaredInventoryFilter(filter)
    }, [setByStoreStaredInventoryFilter])

    // Create computed atoms that derive from byStoreStateAtom
    // These atoms are created once and always reflect the current state
    const staredItemsAtom = useMemo(() =>
        atom((get) => {
            const inventory = get(byStoreStateAtom)
            return inventory?.staredItems ?? []
        })
    , [])

    const regularItemsAtom = useMemo(() =>
        atom((get) => {
            const inventory = get(byStoreStateAtom)
            return inventory?.items ?? []
        })
    , [])

    // Helper to render name column with tree indentation and editing
    const renderNameColumn = (isFavorite: boolean) => (item: TreeLineData): CellElement => {
        const handleExpandToggle = () => {
            if (isFavorite) {
                setByStoreStaredItemExpanded(item.id, !item.expanded)
            } else if (byStoreFilter) {
                setByStoreItemExpandedOnFilter(item.id, item.n, !item.expanded)
            } else {
                setByStoreItemExpanded(item.id, item.n, !item.expanded)
            }
        }

        const handleEditStart = () => {
            if (isFavorite) {
                startByStoreStaredItemEdit(item.id)
            } else {
                startByStoreItemEdit(item.id)
            }
        }

        const handleEditCancel = () => {
            if (isFavorite) {
                cancelByStoreStaredItemEdit()
            } else {
                cancelByStoreItemEdit()
            }
        }

        const handleEditConfirm = () => {
            if (isFavorite) {
                confirmByStoreStaredItemEdit()
            } else {
                confirmByStoreItemEdit(item.id)
            }
        }

        const handleNameChange = (value: string) => {
            if (isFavorite) {
                setByStoreStaredItemName(item.id, value)
            } else {
                setByStoreItemName(item.id, value)
            }
        }

        const handleSetStared = (stared: boolean) => {
            if (isFavorite) {
                setByStoreStaredItemStared(item.id, stared)
            } else {
                setByStoreItemStared(item.id, stared)
            }
        }

        const children: CellElement[] = []

        // Add indent spacer for tree structure
        if (item.indent > 0) {
            children.push({
                type: 'text',
                value: '\u00A0'.repeat(item.indent * 4) // Use non-breaking spaces for indentation
            })
        }

        // Add expand/collapse button if expandable
        if (item.expanded !== undefined) {
            children.push({
                type: 'textButton',
                text: item.expanded ? '▼' : '▶',
                onClick: handleExpandToggle,
                title: item.expanded ? 'Collapse' : 'Expand',
                style: {
                    padding: 0,
                    color: 'unset',
                    margin: '0px',
                    fontSize: '12px'
                }
            })
        }

        // Add editing or display mode
        if (item.isEditing) {
            children.push({
                type: 'input',
                inputType: 'text',
                value: item.n,
                onChange: handleNameChange,
                width: 'flex',
                style: { marginRight: '4px' }
            })
            children.push({
                type: 'button',
                icon: 'img/cross.png',
                width: 16,
                height: 16,
                onClick: handleEditCancel,
                title: 'Cancel'
            })
            children.push({
                type: 'button',
                icon: 'img/tick.png',
                width: 16,
                height: 16,
                onClick: handleEditConfirm,
                title: 'Confirm'
            })
        } else {
            children.push({
                type: 'text',
                value: item.n,
                style: { flex: 1 }
            })
            if (item.canEditName) {
                children.push({
                    type: 'button',
                    icon: 'img/edit.png',
                    width: 16,
                    height: 16,
                    onClick: handleEditStart,
                    title: 'Edit this item name'
                })
            }
        }

        // Add star button for containers
        if (item.isContainer) {
            children.push({
                type: 'button',
                icon: item.stared ? 'img/staron.png' : 'img/staroff.png',
                width: 16,
                height: 16,
                onClick: () => handleSetStared(!item.stared),
                title: item.stared ? 'Remove from Favorites' : 'Add to Favorites'
            })
        }

        return {
            type: 'row',
            gap: 4,
            alignItems: 'center',
            children
        }
    }

    // Column config for stared containers
    const staredColumnsConfig = [
        {
            id: 'name',
            header: 'Name',
            width: 200,
            sortAccessor: (item: TreeLineData) => item.n,
            filterAccessor: (item: TreeLineData) => item.n,
            renderRow: renderNameColumn(true)
        },
        {
            id: 'container',
            header: 'Planet',
            width: 120,
            sortAccessor: (item: TreeLineData) => item.c,
            filterAccessor: (item: TreeLineData) => item.c,
            justifyContent: 'center' as const,
            renderRow: (item: TreeLineData) => ({
                type: 'text' as const,
                value: item.c
            })
        },
        {
            id: 'quantity',
            header: 'Quantity',
            width: 100,
            sortAccessor: (item: TreeLineData) => parseFloat(item.q),
            filterAccessor: (item: TreeLineData) => item.q,
            justifyContent: 'end' as const,
            renderRow: (item: TreeLineData) => ({
                type: 'text' as const,
                value: item.q
            })
        },
        {
            id: 'value',
            header: 'Value',
            width: 100,
            sortAccessor: (item: TreeLineData) => parseFloat(item.v),
            filterAccessor: (item: TreeLineData) => item.v,
            justifyContent: 'end' as const,
            renderRow: (item: TreeLineData) => ({
                type: 'text' as const,
                value: `${item.v} PED`
            })
        }
    ]

    // Column config for regular containers
    const regularColumnsConfig = [
        {
            id: 'name',
            header: 'Name',
            width: 200,
            sortAccessor: (item: TreeLineData) => item.n,
            filterAccessor: (item: TreeLineData) => item.n,
            renderRow: renderNameColumn(false)
        },
        {
            id: 'quantity',
            header: 'Quantity',
            width: 100,
            sortAccessor: (item: TreeLineData) => parseFloat(item.q),
            filterAccessor: (item: TreeLineData) => item.q,
            justifyContent: 'end' as const,
            renderRow: (item: TreeLineData) => ({
                type: 'text' as const,
                value: item.q
            })
        },
        {
            id: 'value',
            header: 'Value',
            width: 100,
            sortAccessor: (item: TreeLineData) => parseFloat(item.v),
            filterAccessor: (item: TreeLineData) => item.v,
            justifyContent: 'end' as const,
            renderRow: (item: TreeLineData) => ({
                type: 'text' as const,
                value: `${item.v} PED`
            })
        }
    ]

    // Return loading state if data not loaded yet
    if (!inv) {
        return <div className='flex'>Loading inventory data...</div>
    }

    // Expand/collapse all controls
    const expandAllStaredButton = (
        <button onClick={() => setByStoreStaredAllItemsExpanded(true)} title='Expand All'>+</button>
    )
    const collapseAllStaredButton = (
        <button onClick={() => setByStoreStaredAllItemsExpanded(false)} title='Collapse All'>-</button>
    )

    const expandAllButton = (
        <button onClick={() => byStoreFilter ? setByStoreAllItemsExpandedOnFilter(true) : setByStoreAllItemsExpanded(true)} title='Expand All'>+</button>
    )
    const collapseAllButton = (
        <button onClick={() => byStoreFilter ? setByStoreAllItemsExpandedOnFilter(false) : setByStoreAllItemsExpanded(false)} title='Collapse All'>-</button>
    )

    const commonConfig = {
        itemTypeName: 'item',
        getRowKey: (item: TreeLineData) => item.id,
        getPedValue: (item: TreeLineData) => item.indent === 0 ? parseFloat(item.v) : 0,
        getCountValue: (item: TreeLineData) => item.indent === 0 ? parseFloat(item.q.slice(1, -1)) : 0
    }

    return (
        <div className='flex'>
            {inv.staredItems.length > 0 && (
                <JotaiSortableTableSection
                    selector='InventoryByStoreList.staredContainers'
                    title='Favorite Containers'
                    subtitle='Your favorite containers'
                    itemsAtom={staredItemsAtom}
                    config={{
                        title: 'Favorite Containers',
                        columns: staredColumnsConfig,
                        ...commonConfig
                    }}
                    onSortChange={handleSortStared}
                    onFilterChange={handleFilterStared}
                    afterSearch={
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {expandAllStaredButton}
                            {collapseAllStaredButton}
                        </div>
                    }
                />
            )}
            <JotaiSortableTableSection
                selector='InventoryByStoreList.byContainers'
                title='List by Containers'
                subtitle='Your items organized by containers'
                itemsAtom={regularItemsAtom}
                config={{
                    title: 'List by Containers',
                    columns: regularColumnsConfig,
                    ...commonConfig
                }}
                onSortChange={handleSortContainers}
                onFilterChange={handleFilterContainers}
                afterSearch={
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {expandAllButton}
                        {collapseAllButton}
                    </div>
                }
            />
        </div>
    )
}

export default InventoryByStoreList