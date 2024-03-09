import React from 'react'
import { useSelector } from 'react-redux';
import { getStream } from '../../application/selectors/stream';
import useBackground from '../hooks/UseBackground';
import StreamViewDiv from '../../../stream/StreamViewDiv';
import { StreamState } from '../../application/state/stream';

function StreamView() {
    const s: StreamState = useSelector(getStream)
    const { enabled, background } = s.in
    const d = s.out?.data

    useBackground(background.selected, 'stream', [ s ])

    if (enabled && d)
        return (
            <section>
                <StreamViewDiv background={d.background} delta={d.delta} message={d.message}/>
            </section>
        )
    else
        return <></>
}

export default StreamView