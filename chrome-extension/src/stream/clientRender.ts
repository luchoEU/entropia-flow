import { init, propsModule, styleModule, VNode } from 'snabbdom'
import { StreamRenderSingle, StreamRenderSize } from "./data"
import StreamViewDiv from "./StreamViewDiv"
import reactElementToVNode from "./ReactToSnabb"
import loadBackground from "./background"

const patch = init([
    propsModule, // for setting properties on DOM elements
    styleModule, // handles styling on elements with support for animations
])

const STREAM_ID = 'stream'

let isRendering = false;
export function render(single: StreamRenderSingle, dispatch: (action: string) => void, scale?: number, minSize?: StreamRenderSize): StreamRenderSize | null {
    if (isRendering) {
        return null;
    }

    isRendering = true;
    try {
        if (!single.layout) {
            throw new Error('Undefined layout!');
        }

        // render
        let streamElement: HTMLElement = document.getElementById(STREAM_ID);
        const vNode: VNode = reactElementToVNode(StreamViewDiv({ id: STREAM_ID, size: undefined, single, scale }));
        if (streamElement.children.length > 0) {
            // patch root element manually to preserve canvas
            if (vNode.data.style) {
                Object.entries(vNode.data.style)
                    .forEach(([k, v]) => streamElement.style[k] = v);
                Array.from(streamElement.style)
                    .filter(s => s !== 'color' && !vNode.data.style[s]) // color is handled by background
                    .forEach(s => streamElement.style.removeProperty(s));
            } else {
                streamElement.removeAttribute('style');
            }
            for (let i = 0; i < streamElement.children.length && i < vNode.children.length; i++) {
                patch(streamElement.children[i], vNode.children[i] as VNode);
            }
        } else {
            patch(streamElement, vNode);
        }
        streamElement = document.getElementById(STREAM_ID); // get it again after patch

        // add click handlers
        const handleClick = (e) => dispatch(e.target.dataset.click);
        const clickableElements = streamElement.querySelectorAll('[data-click]');
        clickableElements?.forEach((el: HTMLElement) => el.addEventListener('click', handleClick));

        // load background
        loadBackground(single.layout.backgroundType, streamElement, streamElement)

        // calculate and set size
        let size: StreamRenderSize = null;
        const contentElement: HTMLElement  = streamElement.querySelector('.layout-root');
        if (contentElement) {
            const calc = (v: number, min?: number): number => Math.max(min ?? 0, scale ? v * scale : v);
            size = {
                width: calc(contentElement.offsetWidth, minSize?.width),
                height: calc(contentElement.offsetHeight, minSize?.height)
            }
            streamElement.style.width = `${size.width}px`;
            streamElement.style.height = `${size.height}px`;
        }
        return size;
    } catch (e) {
        console.error(e);
        const streamElement = document.getElementById(STREAM_ID);
        if (streamElement) {
            streamElement.removeAttribute('style');
            streamElement.className = 'entropia-flow-client-error';
            streamElement.innerHTML = `<p>${e.message}</p>`;
        }
        return null;
    } finally {
        isRendering = false;
    }
}
