import React from 'react'
import { RowValueRender } from './SortableTabularSection.data'
import { useSelector } from 'react-redux'
import { getStream } from '../../application/selectors/stream'
import StreamViewLayout from '../stream/StreamViewLayout'
import BaseRowValueRender from './SortableTabularSection.baseRender'

const _LayoutRowValueRender = (next: RowValueRender): RowValueRender => (p) => {
    const { v } = p
    if (typeof v === 'object' && 'layout' in v) {
        const { out: { data: { commonData, layoutData } } } = useSelector(getStream)
        return <StreamViewLayout single={{ data: { ...commonData, ...layoutData[v.layoutId] }, layout: v.layout}} layoutId={v.layoutId} id={v.id} scale={v.scale} />
    }
    const RowValueRenderComponent = next;
    return <RowValueRenderComponent v={v} />;
}

const LayoutRowValueRender = _LayoutRowValueRender(BaseRowValueRender)

export default LayoutRowValueRender
