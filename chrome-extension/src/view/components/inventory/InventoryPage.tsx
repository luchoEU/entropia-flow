import React from 'react'
import { useSelector } from 'react-redux'
import { getInventory } from '../../application/selectors/inventory'
import { InventoryState } from '../../application/state/inventory'
import InventoryHiddenList from './InventoryHiddenList'
import InventoryVisibleList from './InventoryVisibleList'
import InventoryByStoreList from './InventoryByStoreList'

function InventoryPage() {
    const s: InventoryState = useSelector(getInventory)

    return (
        <>
            <div>
                <InventoryByStoreList inv={s.byStore}/>
            </div>
            <div>
                <InventoryVisibleList list={s.visible}/>
            </div>
            <div>
                <InventoryHiddenList list={s.hidden} />
            </div>
        </>
    )
}

export default InventoryPage
