import React from "react"
import { StreamRenderSingle } from "../../../stream/data"
import StreamViewDiv from "../../../stream/StreamViewDiv"
import useBackground from "../hooks/UseBackground"
import { getBackgroundSpec } from "../../../stream/background"

function StreamViewLayout(p: {
    id: string,
    data: StreamRenderSingle,
    scale?: number
}) {
    const backgroundType = p.data.layout.backgroundType
    useBackground(backgroundType, p.id)
    const backDark = getBackgroundSpec(backgroundType)?.dark ?? false
    const data = { data: { ...p.data.data, backDark}, layout: p.data.layout }

    return (
        <StreamViewDiv id={p.id} data={data} scale={p.scale} />
    )
}

export default StreamViewLayout
