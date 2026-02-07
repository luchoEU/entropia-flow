import React, { useMemo, useCallback } from 'react'
import { atom } from 'jotai'
import { useAtomValue, useSetAtom } from 'jotai'
import { InventoryByStore, TreeLineData } from '../../application/state/inventory'
import { JotaiSortableTableSection } from '../common/jotai/JotaiSortableTableSection'
import ImgButton from '../common/ImgButton'
import ExpandablePlusButton from '../common/ExpandablePlusButton'
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

const INDENT_SPACE = 10

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
    const renderNameColumn = (_showContainer: boolean, isFavorite: boolean) => (item: TreeLineData) => {
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

        return (
            <div style={{ display: 'flex', alignItems: 'center', paddingLeft: `${item.indent * INDENT_SPACE}px` }}>
                {item.expanded !== undefined && (
                    <ExpandablePlusButton expanded={item.expanded} setExpanded={handleExpandToggle} />
                )}
                {item.isEditing ? (
                    <>
                        <input
                            type='text'
                            value={item.n}
                            onChange={(e) => handleNameChange(e.target.value)}
                            style={{ flex: 1, marginRight: '4px' }}
                        />
                        <ImgButton title='Cancel' src='img/cross.png' dispatch={handleEditCancel} />
                        <ImgButton title='Confirm' src='img/tick.png' dispatch={handleEditConfirm} />
                    </>
                ) : (
                    <>
                        <span style={{ flex: 1 }}>{item.n}</span>
                        {item.canEditName && (
                            <ImgButton title='Edit this item name' src='img/edit.png' dispatch={handleEditStart} />
                        )}
                    </>
                )}
                {item.isContainer && (
                    <ImgButton
                        title={item.stared ? 'Remove from Favorites' : 'Add to Favorites'}
                        src={item.stared ? 'img/staron.png' : 'img/staroff.png'}
                        dispatch={() => handleSetStared(!item.stared)}
                    />
                )}
            </div>
        )
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
            renderRowCell: memoizedRenderNameStared
        },
        {
            id: 'container',
            header: 'Planet',
            width: 120,
            sortAccessor: (item: TreeLineData) => item.c,
            filterAccessor: (item: TreeLineData) => item.c,
            justifyContent: 'center' as const,
            renderRowCell: (item: TreeLineData) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{item.c}</span>
                </div>
            )
        },
        {
            id: 'quantity',
            header: 'Quantity',
            width: 100,
            sortAccessor: (item: TreeLineData) => parseFloat(item.q),
            filterAccessor: (item: TreeLineData) => item.q,
            justifyContent: 'end' as const,
            renderRowCell: (item: TreeLineData) => <>{item.q}</>
        },
        {
            id: 'value',
            header: 'Value',
            width: 100,
            sortAccessor: (item: TreeLineData) => parseFloat(item.v),
            filterAccessor: (item: TreeLineData) => item.v,
            justifyContent: 'end' as const,
            renderRowCell: (item: TreeLineData) => <>{item.v} PED</>
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
            renderRowCell: memoizedRenderNameRegular
        },
        {
            id: 'quantity',
            header: 'Quantity',
            width: 100,
            sortAccessor: (item: TreeLineData) => parseFloat(item.q),
            filterAccessor: (item: TreeLineData) => item.q,
            justifyContent: 'end' as const,
            renderRowCell: (item: TreeLineData) => <>{item.q}</>
        },
        {
            id: 'value',
            header: 'Value',
            width: 100,
            sortAccessor: (item: TreeLineData) => parseFloat(item.v),
            filterAccessor: (item: TreeLineData) => item.v,
            justifyContent: 'end' as const,
            renderRowCell: (item: TreeLineData) => <>{item.v} PED</>
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