import React from 'react'
import HiddenList from './HiddenList'
import VisibleList from './VisibleList'

function InventoryPage() {
    return (
        <>
            <div>
                <VisibleList />
            </div>
            <div>
                <HiddenList />
            </div>
        </>
    )
}

export default InventoryPage
