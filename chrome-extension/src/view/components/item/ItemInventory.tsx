import { useDispatch, useSelector } from "react-redux"
import { NAME, QUANTITY, sortColumnDefinition, VALUE } from "../../application/helpers/inventory.sort"
import { InventoryByStore, TreeLineData } from "../../application/state/inventory"
import { SortableFixedSizeTable, TableData } from "../common/SortableTableSection"
import { getByStoreInventory, getByStoreInventoryMaterialItem } from "../../application/selectors/inventory"
import React, { useEffect } from "react"
import { setByStoreMaterialFilter, setByStoreMaterialItemExpanded, sortByStoreMaterialBy } from "../../application/actions/inventory"

const INDENT_SPACE = 10
const inventoryTableData: TableData<TreeLineData> = {
    columns: [NAME, QUANTITY, VALUE],
    definition: sortColumnDefinition,
    sortRow: {
        [NAME]: { justifyContent: 'center', text: 'Name in Inventory' },
        [QUANTITY]: { justifyContent: 'end' },
        [VALUE]: { justifyContent: 'end' },
    },
    getRow: (item: TreeLineData) => ({
        dispatch: item.expanded !== undefined ? () => setByStoreMaterialItemExpanded(item.id)(!item.expanded) : undefined,
        columns: {
            [NAME]: {
                style: { paddingLeft: item.indent * INDENT_SPACE },
                sub: [
                    { plusButton: { expanded: item.expanded, setExpanded: setByStoreMaterialItemExpanded(item.id) } },
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

const ItemInventory = ({ filter }: { filter: string }) => {
    const inv: InventoryByStore = useSelector(getByStoreInventory)
    const dispatch = useDispatch()

    useEffect(() => {
        if (filter === inv.material.filter) return // already set
        dispatch(setByStoreMaterialFilter(filter))
    }, [filter])

    return <>
        { inv.flat.material.length === 0 ?
            <p><strong>None on Inventory</strong></p> :
            <SortableFixedSizeTable
                data={{
                    allItems: inv.flat.material,
                    showItems: inv.flat.material,
                    sortType: inv.material.list.sortType,
                    sortBy: sortByStoreMaterialBy,
                    itemSelector: getByStoreInventoryMaterialItem,
                    tableData: inventoryTableData
                }}
            />
        }
    </>
}

export default ItemInventory
