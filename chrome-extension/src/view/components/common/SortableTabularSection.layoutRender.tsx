import React from 'react'
import { RowValueRender } from './SortableTabularSection.data'
import { useAtomValue } from 'jotai'
import { streamStateAtom } from '../../application/atoms/stream'
import StreamViewLayout from '../stream/StreamViewLayout'
import BaseRowValueRender from './SortableTabularSection.baseRender'

const _LayoutRowValueRender = (next: RowValueRender): RowValueRender => (p) => {
    const { v } = p
    if (typeof v === 'object' && 'layout' in v) {
        const streamState = useAtomValue(streamStateAtom)
        const { commonData, layoutData } = streamState.out?.data ?? { commonData: {}, layoutData: {} }
        return <StreamViewLayout single={{ data: { ...commonData, ...layoutData[v.layoutId] }, layout: v.layout}} layoutId={v.layoutId} id={v.id} scale={v.scale} />
    }
    const RowValueRenderComponent = next;
    return <RowValueRenderComponent v={v} />;
}

const LayoutRowValueRender = _LayoutRowValueRender(BaseRowValueRender)

export default LayoutRowValueRender
