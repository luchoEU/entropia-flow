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
        let contentElement: HTMLElement = streamElement.querySelector('.stream-content');
        if (contentElement && vNode.children.length > 0 && contentElement.localName === (vNode.children[0] as VNode).sel) {
            // patch only first child to avoid flickering in background
            patch(contentElement, vNode.children[0] as VNode)
            if (vNode.data.style) {
                Object.entries(vNode.data.style).forEach(([key, value]) => streamElement.style[key] = value)
                let keys = [
                    ...Object.keys(vNode.data.style),
                    'color' // color is handled separately by background
                ]
                if (streamElement.style.length > keys.length) {
                    keys = keys.map(key => key.replace(/[A-Z]/g, '-$&').toLowerCase()); // transformOrigin to transform-origin and similar
                    Array.from(streamElement.style).filter(k => !keys.includes(k)).forEach(k => streamElement.style.removeProperty(k));
                }
            } else {
                streamElement.removeAttribute('style');
            }
        } else {
            patch(streamElement, vNode)
            streamElement = document.getElementById(STREAM_ID); // get it again after patch
        }

        // load background
        loadBackground(single.layout.backgroundType, streamElement, streamElement)

        // calculate and set size
        let size: StreamRenderSize = null;
        contentElement = streamElement.querySelector('.stream-content');
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
            streamElement.style.backgroundColor = 'white';
            streamElement.style.color = 'red';
            streamElement.innerHTML = `<p>${e.message}</p>`;
        }
        return null;
    } finally {
        isRendering = false;
    }
}
