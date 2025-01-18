import React, { useEffect, useRef, useState } from "react"
import ReactDOM from "react-dom"
import { StreamRenderSingle, StreamRenderSize } from "../../../stream/data"
import StreamViewDiv from "../../../stream/StreamViewDiv"
import useBackground from "../hooks/UseBackground"
import { useDispatch } from "react-redux"
import { setLast } from "../../application/actions/messages"

const _cacheSize: Record<string, StreamRenderSize> = { }

function StreamViewLayout(p: {
    id: string // each should have a unique id for background to work
    layoutId: string // to cache the size
    single: StreamRenderSingle,
    scale?: number
}) {
    const { id, layoutId, single, scale } = p;
    const shadowRootRef = useRef(null);
    const dispatch = useDispatch()

    useEffect(() => {
        if (shadowRootRef.current && !shadowRootRef.current.shadowRoot) {
            shadowRootRef.current.attachShadow({ mode: 'open' });
        }
    }, []);

    const handleClick = (e) => {
        switch (e.target.dataset.click) {
            case 'flowSetLast': {
                dispatch(setLast);
                break;
            }
            default: {
                console.log(`Unknown click action: ${e.target.dataset.click}`);
                break;
            }
        }
    };
    useEffect(() => {
        const clickableElements = shadowRootRef.current?.shadowRoot.querySelectorAll('[data-click]');
        clickableElements?.forEach((el: HTMLElement) => el.addEventListener('click', handleClick));
        return () => {
            clickableElements?.forEach((el: HTMLElement) => el.removeEventListener('click', handleClick));
        };
    }, [id, layoutId, single, scale]);

    const contentRect = shadowRootRef.current?.shadowRoot.querySelector('.layout-root')?.getBoundingClientRect();
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
    const children = <StreamViewDiv id={id} size={size} single={single} scale={scale} />

    return (
        <div ref={shadowRootRef}>
            {shadowRootRef.current &&
                ReactDOM.createPortal(children, shadowRootRef.current.shadowRoot)}
        </div>
    );
};

export default StreamViewLayout
