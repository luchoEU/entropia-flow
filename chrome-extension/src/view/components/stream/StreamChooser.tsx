import React from "react"
import { useSelector } from "react-redux"
import { getStream } from "../../application/selectors/stream"
import StreamViewLayout from "./StreamViewLayout"
import { addStreamLayout, removeStreamLayout, setStreamEditing, setStreamStared } from "../../application/actions/stream"
import SortableTabularSection from "../common/SortableTabularSection"
import { STREAM_TABULAR_CHOOSER } from "../../application/state/stream"
import { StreamRenderLayout } from "../../../stream/data"

interface StreamChooserLine {
    id: string,
    name: string,
    readonly: boolean,
    stared: boolean,
    layout: StreamRenderLayout
}

function StreamChooser() {
    const { out: { data: { data } } } = useSelector(getStream)

    return <SortableTabularSection
        title='Layouts'
        selector={STREAM_TABULAR_CHOOSER}
        columns={[ 'Name', 'Preview' ]}
        getRow={(g: StreamChooserLine, i: number) => [
            [ g.name,
                { flex: 1 },
                { img: g.stared ? 'img/staron.png' : 'img/staroff.png', title: 'Set as default', show: true, dispatch: () => setStreamStared(g.id, !g.stared) },
                { img: 'img/edit.png', title: 'Edit', dispatch: () => setStreamEditing(g.id) },
                { img: 'img/cross.png', title: 'Remove', dispatch: () => removeStreamLayout(g.id), visible: !g.readonly },
            ], {
                tsx: <StreamViewLayout id={`stream-chooser-${i}`} layoutId={g.id} single={{ data, layout: g.layout }} scale={0.4} />,
                width: 200
            }]}
        afterSearch={[ { button: 'Add', dispatch: () => addStreamLayout } ]}
        itemHeight={64}
        useTable={true}
   />
}

export default StreamChooser
