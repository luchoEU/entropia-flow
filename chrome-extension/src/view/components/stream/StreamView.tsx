import React from 'react'
import { useSelector } from 'react-redux';
import { getStream } from '../../application/selectors/stream';
import StreamViewLayout from './StreamViewLayout';
import { StreamState } from '../../application/state/stream';
import { createSelector } from '@reduxjs/toolkit';
import ExpandableSection from '../common/ExpandableSection2';
import ImgButton from '../common/ImgButton';
import { getShowVisibility, getStreamViewPinned } from '../../application/selectors/mode';
import { pinStreamView } from '../../application/actions/mode';

const selectEnabledViewAndData = createSelector(
    getStream,
    (stream: StreamState) => ({
        view: stream.in.view,
        d: stream.out?.data,
    })
);

function StreamView() {
    const { view, d } = useSelector(selectEnabledViewAndData)
    const showVisibility = useSelector(getShowVisibility);
    const streamViewPinned = useSelector(getStreamViewPinned);

    return d && (
        <ExpandableSection selector='StreamView' title='' subtitle='Stream View' hideExpandableArrow className='stream-view-section'
            afterTitle={showVisibility && <ImgButton
                title={`click to ${streamViewPinned ? 'Unpin' : 'Pin'} Stream View`}
                className='img-btn-stream-view-pin'
                src={streamViewPinned ? 'img/pinOn.png' : 'img/pinOff.png'}
                dispatch={() => pinStreamView(!streamViewPinned)}
            />}
        >
            {view.map((w, i) => <StreamViewLayout key={i} id={`stream-view-${i}`} layoutId={w} single={{ data: d.data, layout: d.layouts[w] }} />)}
        </ExpandableSection>
    )
}

export default StreamView
