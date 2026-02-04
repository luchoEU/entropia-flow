import { useAtomValue, useSetAtom } from "jotai"
import { NAME, QUANTITY, sortColumnDefinition, VALUE } from "../../application/helpers/inventory.sort"
import { InventoryByStore, TreeLineData } from "../../application/state/inventory"
import { SortableFixedSizeTable, TableData } from "../common/SortableTableSection"
import React, { useEffect, useCallback } from "react"
import { setByStoreMaterialFilterAtom, setByStoreMaterialItemExpandedAtom, sortByStoreMaterialByAtom, byStoreStateAtom } from "../../application/atoms/inventory"

const INDENT_SPACE = 10
const ItemInventory = ({ filter }: { filter: string }) => {
    const inv: InventoryByStore = useAtomValue(byStoreStateAtom)
    const setFilter = useSetAtom(setByStoreMaterialFilterAtom)
    const setExpanded = useSetAtom(setByStoreMaterialItemExpandedAtom)
    const setSortMaterial = useSetAtom(sortByStoreMaterialByAtom)

    // Replace Redux selector with Jotai-based lookup function
    // Note: Redux selector returns (state) => TreeLineData, but we have state available, so return a function
    const getByStoreInventoryMaterialItem = useCallback((index: number) => {
        return (_state: any) => inv.flat.material[index]
    }, [inv])

    // Handlers: update Jotai atoms
    const handleSetExpanded = useCallback((itemId: string) => (expanded: boolean) => {
        setExpanded(itemId, expanded)
    }, [setExpanded])

    // Handler for sorting
    const handleSortMaterial = useCallback((part: number) => {
        setSortMaterial(part)
    }, [setSortMaterial])

    // Create inventory table data with Jotai-aware handlers
    const inventoryTableData: TableData<TreeLineData> = {
        columns: [NAME, QUANTITY, VALUE],
        definition: sortColumnDefinition,
        sortRow: {
            [NAME]: { justifyContent: 'center', text: 'Name in Inventory' },
            [QUANTITY]: { justifyContent: 'end' },
            [VALUE]: { justifyContent: 'end' },
        },
        getRow: (item: TreeLineData) => ({
            dispatch: item.expanded !== undefined ? () => handleSetExpanded(item.id)(!item.expanded) : undefined,
            columns: {
                [NAME]: {
                    style: { paddingLeft: item.indent * INDENT_SPACE },
                    sub: [
                        { plusButton: { expanded: item.expanded, setExpanded: handleSetExpanded(item.id) } },
                        { itemText: item.n }
                    ]
                },
                [QUANTITY]: {
                    style: { justifyContent: 'center' },
                    sub: [{ itemText: item.q }]
                },
                [VALUE]: {
                    style: { justifyContent: 'center' },
                    sub: [{ itemText: item.v }]
                }
            }
        })
    }

    useEffect(() => {
        if (filter === inv.material.filter) return // already set
        setFilter(filter)
    }, [filter, setFilter])

    return <>
        { !inv?.flat?.material || inv.flat.material.length === 0 ?
            <p><strong>None on Inventory</strong></p> :
            <SortableFixedSizeTable
                data={{
                    showItems: inv.flat.material,
                    sortType: inv.material.list.sortType,
                    sortBy: handleSortMaterial,
                    itemSelector: getByStoreInventoryMaterialItem,
                    tableData: inventoryTableData
                }}
            />
        }
    </>
}

export default ItemInventory
