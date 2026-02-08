import React, { useMemo } from 'react'
import { useAtomValue, useSetAtom } from 'jotai';
import { streamStateAtom, setStreamShowingLayoutIdAtom } from '../../application/atoms/stream';
import { modeAtom, pinStreamViewAtom } from '../../application/atoms/mode';
import StreamViewLayout from './StreamViewLayout';
import { StreamState } from '../../application/state/stream';
import ExpandableSection from '../common/ExpandableSection';
import ImgButton from '../common/ImgButton';

function StreamView() {
    const streamState = useAtomValue(streamStateAtom)
    const modeState = useAtomValue(modeAtom)
    const setPinStreamView = useSetAtom(pinStreamViewAtom)

    const view = useMemo(() => streamState.in.view, [streamState.in.view])
    const d = useMemo(() => streamState.out?.data, [streamState.out?.data])
    const showVisibility = useMemo(() => modeState.showVisibleToggle, [modeState.showVisibleToggle])
    const streamViewPinned = useMemo(() => modeState.streamViewPinned, [modeState.streamViewPinned])

    return view.some((w, _) => d?.layoutData[w]) && (
        <ExpandableSection selector='StreamView' title='' subtitle='Stream View' hideExpandableArrow className='stream-view-section'
            afterTitle={showVisibility ? <ImgButton
                title={`click to ${streamViewPinned ? 'Unpin' : 'Pin'} Stream View`}
                className='img-btn-stream-view-pin'
                src={streamViewPinned ? 'img/pinOn.png' : 'img/pinOff.png'}
                show
                dispatch={() => { setPinStreamView(!streamViewPinned); return true }}
            /> : undefined}
        >
            {view.map((w, i) => d.layoutData[w] && <StreamViewLayout key={w} id={`stream-view-${i}`} layoutId={w} single={{ data: { ...d.commonData, ...d.layoutData[w] }, layout: d.layouts[w] }} />)}
        </ExpandableSection>
    )
}

export default StreamView
