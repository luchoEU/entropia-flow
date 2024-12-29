
import React from "react"
import { useDispatch, useSelector } from "react-redux"
import { STREAM_TABULAR_IMAGES, STREAM_TABULAR_VARIABLES, StreamVariable } from "../../application/state/stream"
import SortableTableSection from "../common/SortableTableSection2"
import { getStreamIn } from "../../application/selectors/stream"
import { setStreamTemplate } from "../../application/actions/stream"
import { StreamRenderValue } from "../../../stream/data"

function StreamEditor() {
    const { definition: { template } } = useSelector(getStreamIn)
    const dispatch = useDispatch()

    const str = (v: StreamRenderValue): string => typeof v === 'string' ? v : JSON.stringify(v)
    return <div className='flex'>
        <SortableTableSection
                title='Variables'
                selector={STREAM_TABULAR_VARIABLES}
                columns={['Source', 'Name', 'Value', 'Computed', 'Description']}
                getRow={(g: StreamVariable) => [g.source, g.name, str(g.value), str(g.computed), g.description]}
            />
        <SortableTableSection
                title='Images'
                selector={STREAM_TABULAR_IMAGES}
                columns={['Source', 'Name', 'Image', 'Description']}
                getRow={(g: StreamVariable) => [g.source, g.name, { img: g.value as string }, g.description]}
            />
        <section>
            <h1>Template</h1>
            <textarea
                style={{ width: 1200, height: 300 }}
                value={template}
                onClick={(e) => { e.stopPropagation() }}
                onChange={(e) => {
                    e.stopPropagation();
                    dispatch(setStreamTemplate(e.target.value))
                }}
            />
        </section>
    </div>
}

export default StreamEditor