
import React from "react"
import { useDispatch, useSelector } from "react-redux"
import { STREAM_TABULAR_VARIABLES, StreamVariable } from "../../application/state/stream"
import SortableTableSection from "../common/SortableTableSection2"
import { getStreamIn } from "../../application/selectors/stream"
import { setStreamTemplate } from "../../application/actions/stream"

function StreamEditor() {
    const { template } = useSelector(getStreamIn)
    const dispatch = useDispatch()

    return <div className='flex'>
        <SortableTableSection
                title='Variables'
                selector={STREAM_TABULAR_VARIABLES}
                columns={['Source', 'Name', 'Value', 'Description', 'Flags']}
                getRow={(g: StreamVariable) => [g.source, g.name, g.value, g.description, g.isIndirect ? '[Indirect]' : '']}
            />
        <section>
            <h1>Template</h1>
            <textarea
                style={{ width: 1200, height: 300 }}
                value={template.html}
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
