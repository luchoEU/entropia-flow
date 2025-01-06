import React, { useEffect, useRef, useState } from "react"
import ReactDOM from "react-dom"
import { StreamRenderSingle, StreamRenderSize } from "../../../stream/data"
import StreamViewDiv from "../../../stream/StreamViewDiv"
import useBackground from "../hooks/UseBackground"

const _cacheSize: Record<string, StreamRenderSize> = { }

function StreamViewLayout(p: {
    id: string // each should have a unique id for background to work
    layoutId: string // to cache the size
    single: StreamRenderSingle,
    scale?: number
}) {
    const { id, layoutId, single, scale } = p;
    const shadowRootRef = useRef(null);

    useEffect(() => {
        if (shadowRootRef.current) {
            shadowRootRef.current.attachShadow({ mode: 'open' });
        }
    }, []);

    const contentRect = shadowRootRef.current?.shadowRoot.querySelector('.stream-content')?.getBoundingClientRect();
    let size: StreamRenderSize = contentRect && { width: contentRect.width, height: contentRect.height };
    if (size) {
        _cacheSize[layoutId] = scale ? { width: size.width / scale, height: size.height / scale } : size;
    } else {
        size = _cacheSize[layoutId]
        if (size && scale) {
            size = { width: size.width * scale, height: size.height * scale };
        }
    }

    useBackground(single.layout.backgroundType, id, shadowRootRef.current?.shadowRoot);
    const children = <StreamViewDiv id={id} size={size} single={p.single} scale={scale} />

    return (
        <div ref={shadowRootRef}>
            {shadowRootRef.current &&
                ReactDOM.createPortal(children, shadowRootRef.current.shadowRoot)}
        </div>
    );
};

export default StreamViewLayout
