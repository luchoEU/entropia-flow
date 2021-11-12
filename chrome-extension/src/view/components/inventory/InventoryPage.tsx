import React from 'react'
import InventoryList from './InventoryList'
import Last from './Last'
import Status from './Status'

function InventoryPage() {
    return (
        <>
            <div className='inline'>
                <Last />
            </div>
            <div className='inline'>
                <Status />
            </div>
            <div>
                <InventoryList />
            </div>
        </>
    )
}

export default InventoryPage
