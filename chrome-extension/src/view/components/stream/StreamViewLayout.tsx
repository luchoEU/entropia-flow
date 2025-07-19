import React, { useEffect, useRef, useState } from "react"
import ReactDOM from "react-dom"
import { StreamRenderSingle, StreamRenderSize } from "../../../stream/data"
import StreamViewDiv from "../../../stream/StreamViewDiv"
import useBackground from "../hooks/UseBackground"
import { useDispatch } from "react-redux"
import { getStreamClickAction } from "../../application/actions/stream.click"
import { Component, traceError } from "../../../common/trace"

const StreamViewLayout = ({ id, layoutId, single, scale }: {
    id: string
    layoutId: string
    single: StreamRenderSingle,
    scale?: number
}) => {
    const shadowRootRef = useRef<HTMLDivElement>(null);
    const dispatch = useDispatch();

    const [shadowReady, setShadowReady] = useState(false);
    const [size, setSize] = useState<StreamRenderSize | undefined>();

    // Attach shadow root
    useEffect(() => {
        if (shadowRootRef.current && !shadowRootRef.current.shadowRoot) {
            shadowRootRef.current.attachShadow({ mode: 'open' });
            setShadowReady(true);
        }
    }, []);

    // Attach click listeners
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target?.dataset?.click) {
                dispatch(getStreamClickAction(target.dataset.click));
            }
        };

        const clickableElements = shadowRootRef.current?.shadowRoot?.querySelectorAll('[data-click]');
        clickableElements?.forEach((el: Element) => (el as HTMLElement).addEventListener('click', handleClick));
        return () => {
            clickableElements?.forEach((el: Element) => (el as HTMLElement).removeEventListener('click', handleClick));
        };
    }, [shadowReady, id, layoutId, single, scale]);

    // Measure layout size after rendering
    useEffect(() => {
        if (!shadowReady) return;

        const timeout = setTimeout(() => {
            const contentRect = shadowRootRef.current?.shadowRoot?.querySelector('.layout-root')?.getBoundingClientRect();
            if (contentRect) {
                const size: StreamRenderSize = {
                    width: contentRect.width,
                    height: contentRect.height
                };
                setSize(size);
            }
        }, 0); // delay to wait for DOM paint

        return () => clearTimeout(timeout);
    }, [shadowReady, single, scale]);

    useBackground(single.layout?.backgroundType, id, shadowRootRef.current?.shadowRoot, size);

    if (!single.layout) {
        traceError(Component.StreamBackground, `Layout not found for layoutId: ${layoutId}`);
        return <div>Layout not found</div>;
    }

    const children = <StreamViewDiv id={id} size={size} single={{ ...single, data: single.data }} scale={scale} />

    return (
        <div {...(!size && { style: { visibility: 'hidden' }})} ref={shadowRootRef}>
            {shadowReady && shadowRootRef.current?.shadowRoot &&
                ReactDOM.createPortal(children, shadowRootRef.current.shadowRoot)}
        </div>
    );
};

export default StreamViewLayout;
