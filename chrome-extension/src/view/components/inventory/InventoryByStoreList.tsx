import React, { useMemo, useCallback } from 'react'
import { atom } from 'jotai'
import { useAtomValue, useSetAtom } from 'jotai'
import { InventoryByStore, TreeLineData } from '../../application/state/inventory'
import { JotaiSortableTableSection } from '../common/jotai/JotaiSortableTableSection'
import { CellElement } from '../common/jotai/cellDSL'
import {
  setByStoreItemExpandedAtom, setByStoreItemNameAtom,
  confirmByStoreItemNameEditingAtom, cancelByStoreItemNameEditingAtom, startByStoreItemNameEditingAtom,
  setByStoreItemStaredAtom,
  setByStoreStaredItemExpandedAtom, setByStoreStaredItemStaredAtom,
  setByStoreStaredItemNameAtom, cancelByStoreStaredItemNameEditingAtom, startByStoreStaredItemNameEditingAtom,
  confirmByStoreStaredItemNameEditingAtom, setByStoreAllItemsExpandedSimpleAtom, setByStoreStaredAllItemsExpandedAtom,
  byStoreStateAtom,
  sortByStoreByAtom, sortByStoreStaredByAtom
} from '../../application/atoms/inventory'
import { columnIndexToSortType } from '../../application/helpers/inventory.sort'

const InventoryByStoreList = () => {
    const inv: InventoryByStore | null = useAtomValue(byStoreStateAtom)

    // Jotai write atoms
    const setByStoreItemExpanded = useSetAtom(setByStoreItemExpandedAtom)
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
    const setByStoreStaredAllItemsExpanded = useSetAtom(setByStoreStaredAllItemsExpandedAtom)
    const sortByStoreBy = useSetAtom(sortByStoreByAtom)
    const sortByStoreStaredBy = useSetAtom(sortByStoreStaredByAtom)

    // Sort handlers for tree-aware sorting
    const handleSortContainers = useCallback((columnIndex: number, ascending: boolean) => {
        const sortType = columnIndexToSortType(columnIndex, ascending)
        sortByStoreBy(sortType)
    }, [sortByStoreBy])

    const handleSortStared = useCallback((columnIndex: number, ascending: boolean) => {
        const sortType = columnIndexToSortType(columnIndex, ascending)
        sortByStoreStaredBy(sortType)
    }, [sortByStoreStaredBy])

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
    const renderNameColumn = (_showContainer: boolean, isFavorite: boolean) => (item: TreeLineData): CellElement<TreeLineData> => {
        const handleExpandToggle = () => {
            if (isFavorite) {
                setByStoreStaredItemExpanded(item.id, !item.expanded)
            } else {
                setByStoreItemExpanded(item.id, !item.expanded)
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

        const children: CellElement<TreeLineData>[] = []

        // Add indent spacer for tree structure
        if (item.indent > 0) {
            children.push({
                type: 'text' as const,
                value: '\u00A0'.repeat(item.indent * 4) // Use non-breaking spaces for indentation
            })
        }

        // Add expand/collapse button if expandable
        if (item.expanded !== undefined) {
            children.push({
                type: 'button' as const,
                icon: item.expanded ? 'img/down.png' : 'img/right.png',
                width: 16,
                height: 16,
                onClick: handleExpandToggle,
                title: item.expanded ? 'Collapse' : 'Expand'
            })
        }

        // Add editing or display mode
        if (item.isEditing) {
            children.push({
                type: 'input' as const,
                inputType: 'text' as const,
                value: item.n,
                onChange: handleNameChange,
                width: 'flex' as const,
                style: { marginRight: '4px' }
            })
            children.push({
                type: 'button' as const,
                icon: 'img/cross.png',
                width: 16,
                height: 16,
                onClick: handleEditCancel,
                title: 'Cancel'
            })
            children.push({
                type: 'button' as const,
                icon: 'img/tick.png',
                width: 16,
                height: 16,
                onClick: handleEditConfirm,
                title: 'Confirm'
            })
        } else {
            children.push({
                type: 'text' as const,
                value: item.n,
                style: { flex: 1 }
            })
            if (item.canEditName) {
                children.push({
                    type: 'button' as const,
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
                type: 'button' as const,
                icon: item.stared ? 'img/staron.png' : 'img/staroff.png',
                width: 16,
                height: 16,
                onClick: () => handleSetStared(!item.stared),
                title: item.stared ? 'Remove from Favorites' : 'Add to Favorites'
            })
        }

        return {
            type: 'row' as const,
            gap: 4,
            alignItems: 'center' as const,
            children
        }
    }

    // Memoize renderNameColumn to avoid recreating it
    const memoizedRenderNameStared = useMemo(
        () => renderNameColumn(true, true),
        [setByStoreStaredItemExpanded, startByStoreStaredItemEdit, confirmByStoreStaredItemEdit, cancelByStoreStaredItemEdit, setByStoreStaredItemName, setByStoreStaredItemStared]
    )

    const memoizedRenderNameRegular = useMemo(
        () => renderNameColumn(false, false),
        [setByStoreItemExpanded, startByStoreItemEdit, confirmByStoreItemEdit, cancelByStoreItemEdit, setByStoreItemName, setByStoreItemStared]
    )

    // Column config for stared containers
    const staredColumnsConfig = useMemo(() => [
        {
            id: 'name',
            header: 'Name',
            width: 200,
            sortAccessor: (item: TreeLineData) => item.n,
            filterAccessor: (item: TreeLineData) => item.n,
            renderRow: memoizedRenderNameStared
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
    ], [memoizedRenderNameStared])

    // Column config for regular containers
    const regularColumnsConfig = useMemo(() => [
        {
            id: 'name',
            header: 'Name',
            width: 200,
            sortAccessor: (item: TreeLineData) => item.n,
            filterAccessor: (item: TreeLineData) => item.n,
            renderRow: memoizedRenderNameRegular
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
    ], [memoizedRenderNameRegular])

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
        <button onClick={() => setByStoreAllItemsExpanded(true)} title='Expand All'>+</button>
    )
    const collapseAllButton = (
        <button onClick={() => setByStoreAllItemsExpanded(false)} title='Collapse All'>-</button>
    )

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
                        itemTypeName: 'item',
                        getRowKey: (item: TreeLineData) => item.id,
                        getPedValue: (item: TreeLineData) => parseFloat(item.v)
                    }}
                    onSortChange={handleSortStared}
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
                    itemTypeName: 'item',
                    getRowKey: (item: TreeLineData) => item.id,
                    getPedValue: (item: TreeLineData) => parseFloat(item.v)
                }}
                onSortChange={handleSortContainers}
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