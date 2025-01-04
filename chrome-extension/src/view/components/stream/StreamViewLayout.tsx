import React, { useEffect, useRef } from "react"
import ReactDOM from "react-dom"
import { StreamRenderSingle } from "../../../stream/data"
import StreamViewDiv from "../../../stream/StreamViewDiv"
import useBackground from "../hooks/UseBackground"
import { getBackgroundSpec } from "../../../stream/background"

function StreamViewLayout(p: {
    id: string,
    data: StreamRenderSingle,
    scale?: number
}) {
    const shadowRootRef = useRef(null);
    
    useEffect(() => {
        if (shadowRootRef.current) {
            shadowRootRef.current.attachShadow({ mode: 'open' });
        }
    }, []);

    const backgroundType = p.data.layout.backgroundType
    useBackground(backgroundType, p.id, shadowRootRef.current?.shadowRoot);
    const backDark = getBackgroundSpec(backgroundType)?.dark ?? false
    const data = { data: { ...p.data.data, backDark}, layout: p.data.layout }
    const children = <StreamViewDiv id={p.id} data={data} scale={p.scale} />

    return (
        <div ref={shadowRootRef}>
            {shadowRootRef.current &&
                ReactDOM.createPortal(children, shadowRootRef.current.shadowRoot)}
        </div>
    );
};

export default StreamViewLayout
