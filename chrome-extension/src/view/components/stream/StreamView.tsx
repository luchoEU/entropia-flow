import React from 'react'
import { useSelector } from 'react-redux';
import { getStream } from '../../application/selectors/stream';
import StreamViewLayout from './StreamViewLayout';
import { StreamState } from '../../application/state/stream';
import { createSelector } from '@reduxjs/toolkit';

const selectEnabledViewAndData = createSelector(
    getStream,
    (stream: StreamState) => ({
        enabled: stream.in.enabled,
        view: stream.in.view,
        d: stream.out?.data,
    })
);

function StreamView() {
    const { enabled, view, d } = useSelector(selectEnabledViewAndData)

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
