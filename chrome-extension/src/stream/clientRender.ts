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
export function render(single: StreamRenderSingle, scale?: number, minSize?: StreamRenderSize): StreamRenderSize | null {
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
        const canvasElement = streamElement.querySelector('canvas'); // Preserve it to avoid flickering in background
        if (canvasElement) {
            streamElement.removeChild(canvasElement);
        }
        patch(streamElement, vNode)
        if (canvasElement && !streamElement.contains(canvasElement)) {
            streamElement.appendChild(canvasElement);
        }
        streamElement = document.getElementById(STREAM_ID); // get it again after patch

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
