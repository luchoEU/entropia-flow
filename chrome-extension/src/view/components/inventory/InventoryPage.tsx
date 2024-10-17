import React from 'react'
import { useSelector } from 'react-redux'
import { getInventory } from '../../application/selectors/inventory'
import { InventoryState } from '../../application/state/inventory'
import InventoryByStoreList from './InventoryByStoreList'

function InventoryPage() {
    const s: InventoryState = useSelector(getInventory)

    return (
        <>
            <InventoryByStoreList inv={s.byStore}/>
        </>
    )
}

export default InventoryPage
