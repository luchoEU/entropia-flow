import React from 'react'
import History from './History'
import Last from './Last'
import Status from './Status'

function MonitorPage() {
    return (
        <>
            <div className='flex'>
                <Last />
                <Status />
            </div>
            <History />
        </>
    )
}

export default MonitorPage
