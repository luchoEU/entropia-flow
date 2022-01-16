import React from 'react'
import { useSelector } from 'react-redux'
import { getStream } from '../../application/selectors/stream'
import InventoryList from './InventoryList'
import Last from './Last'
import Status from './Status'
import StreamView from './StreamView'

function InventoryPage() {
    const { enabled } = useSelector(getStream);

    return (
        <>
            {enabled ?
                <div>
                    <StreamView />
                </div> : ''
            }
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
