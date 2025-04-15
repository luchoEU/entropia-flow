import React from "react"
import { addStreamLayout } from "../../application/actions/stream"
import SortableTabularSection from "../common/SortableTabularSection"
import { STREAM_TABULAR_CHOOSER } from "../../application/state/stream"
import LayoutRowValueRender from "../common/SortableTabularSection.layoutRender"

function StreamLayoutChooser() {
    return <SortableTabularSection
        selector={STREAM_TABULAR_CHOOSER}
        afterSearch={[ { button: 'Add', dispatch: () => addStreamLayout } ]}
        itemHeight={64}
        useTable={true}
        rowValueRender={LayoutRowValueRender}
   />
}

export default StreamLayoutChooser
