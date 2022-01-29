import React from 'react'
import { useSelector } from 'react-redux'
import { getStream } from '../../application/selectors/stream'
import History from './History'
import Last from './Last'
import Status from './Status'
import StreamView from './StreamView'

function MonitorPage() {
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
                <History />
            </div>
        </>
    )
}

export default MonitorPage
