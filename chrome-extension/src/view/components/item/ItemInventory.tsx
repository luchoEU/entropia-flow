import { useAtomValue } from "jotai"
import { InventoryByStore, TreeLineData } from "../../application/state/inventory"
import { JotaiSortableTable } from "../common/jotai/JotaiSortableTable"
import React, { useMemo } from "react"
import { atom } from "jotai"
import { byStoreStateAtom } from "../../application/atoms/inventory"
import ExpandablePlusButton from "../common/ExpandablePlusButton"

const INDENT_SPACE = 10

const ItemInventory = () => {
    const inv: InventoryByStore | null = useAtomValue(byStoreStateAtom)

    // Create atom for material items
    const materialItemsAtom = useMemo(() => atom(inv?.materialItems ?? []), [inv?.materialItems])

    // Column configuration
    const columns = useMemo(() => [
        {
            id: 'name',
            header: 'Name in Inventory',
            width: 200,
            sortAccessor: (item: TreeLineData) => item.n,
            filterAccessor: (item: TreeLineData) => item.n,
            renderRowCell: (item: TreeLineData) => (
                <div style={{ display: 'flex', alignItems: 'center', paddingLeft: `${item.indent * INDENT_SPACE}px` }}>
                    {item.expanded !== undefined && (
                        <ExpandablePlusButton
                            expanded={item.expanded}
                            setExpanded={()=> {}}
                        />
                    )}
                    <span>{item.n}</span>
                </div>
            )
        },
        {
            id: 'quantity',
            header: 'Quantity',
            width: 120,
            sortAccessor: (item: TreeLineData) => parseFloat(item.q),
            filterAccessor: (item: TreeLineData) => item.q,
            justifyContent: 'center' as const,
            renderRowCell: (item: TreeLineData) => <>{item.q}</>
        },
        {
            id: 'value',
            header: 'Value',
            width: 120,
            sortAccessor: (item: TreeLineData) => parseFloat(item.v),
            filterAccessor: (item: TreeLineData) => item.v,
            justifyContent: 'center' as const,
            renderRowCell: (item: TreeLineData) => <>{item.v}</>
        }
    ], [])

    // Return loading state if data not loaded yet
    if (!inv) {
        return <p><strong>Loading inventory data...</strong></p>
    }

    if (!inv?.materialItems || inv.materialItems.length === 0) {
        return <p><strong>None on Inventory</strong></p>
    }

    return (
        <JotaiSortableTable
            itemsAtom={materialItemsAtom}
            config={{
                title: 'Inventory Materials',
                columns,
                itemTypeName: 'material',
                getRowKey: (item: TreeLineData) => item.id,
                getPedValue: (item: TreeLineData) => parseFloat(item.v)
            }}
            useFixedSizeList={true}
        />
    )
}

export default ItemInventory
