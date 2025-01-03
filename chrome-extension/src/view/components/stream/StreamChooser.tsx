import React from "react"
import { useSelector } from "react-redux"
import { getStream } from "../../application/selectors/stream"
import StreamViewLayout from "./StreamViewLayout"
import { setStreamEditing } from "../../application/actions/stream"
import SortableTabularSection from "../common/SortableTabularSection"
import { STREAM_TABULAR_CHOOSER } from "../../application/state/stream"
import { StreamRenderLayout } from "../../../stream/data"

interface StreamChooserLine {
    name: string,
    layout: StreamRenderLayout
}

function StreamChooser() {
    const { out: { data: { data } } } = useSelector(getStream)

    return <SortableTabularSection
        title='Layouts'
        selector={STREAM_TABULAR_CHOOSER}
        columns={[ 'Name', 'Preview' ]}
        getRow={(g: StreamChooserLine) => [
            [ g.name,
                { img: 'img/edit.png', title: 'Edit', dispatch: () => setStreamEditing(g.name) }
            ], {
                tsx: <StreamViewLayout id={`stream-chooser-${g.name}`} data={{ data, layout: g.layout }} scale={0.4} />,
                width: 300
            }]}
   />
}

export default StreamChooser
