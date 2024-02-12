import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getLast } from '../../application/selectors/last'
import { getStatus } from '../../application/selectors/status';
import { getStream } from '../../application/selectors/stream';
import { StreamState } from '../../application/state/stream';
import { sendWebSocketMessage } from '../../application/actions/messages';
import useBackground from '../hooks/UseBackground';
import { getIcon } from '../../../stream/background';
import StreamViewDiv from '../../../stream/StreamViewDiv';

function StreamView() {
    const dispatch = useDispatch()
    const { enabled } = useSelector(getStream)
    const { delta, deltaClass, deltaWord } = useSelector(getLast)
    const { message } = useSelector(getStatus)
    const { background }: StreamState = useSelector(getStream)

    const data = {
        logoSrc: getIcon(background.selected),
        deltaClass,
        delta,
        deltaWord,
        message
    }

    useEffect(() => {
        dispatch(sendWebSocketMessage('stream', data))
    }, [ data ])

    useBackground(background.selected, 'stream', [ background.selected, enabled ])

    if (enabled)
        return (
            <section>
                <StreamViewDiv logoSrc={data.logoSrc} deltaClass={data.deltaClass} delta={data.delta} deltaWord={data.deltaWord} message={data.message}/>
            </section>
        )
    else
        return <></>
}

export default StreamView