import React from 'react'
import History from './History'
import Last from './Last'
import Status from './Status'

function MonitorPage() {
    return (
        <>
            <div className='inline'>
                <Last />
            </div>
            <div className='inline'>
                <Status />
            </div>
            <div>
                <History />
            </div>
        </>
    )
}

export default MonitorPage
