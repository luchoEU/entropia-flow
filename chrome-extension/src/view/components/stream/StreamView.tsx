import React from 'react'
import { useSelector } from 'react-redux';
import { getStream } from '../../application/selectors/stream';
import StreamViewLayout from './StreamViewLayout';
import { StreamState } from '../../application/state/stream';
import StreamRenderData, { StreamRenderSingle } from '../../../stream/data';

function StreamView() {
    const s: StreamState = useSelector(getStream)
    const { enabled, view } = s.in
    const d: StreamRenderData = s.out?.data

    if (enabled && d) {
        return (
            <section className='stream-view-section'>
                {
                    view.map((w, i) =>
                        <StreamViewLayout key={i} id={`stream-view-${i}`} layoutId={w} single={{ data: d.data, layout: d.layouts[w] }} />
                    )
                }
            </section>
        )
    } else
        return <></>
}

export default StreamView
