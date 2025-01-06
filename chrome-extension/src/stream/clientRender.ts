import { init, propsModule, styleModule, VNode } from 'snabbdom'
import { StreamRenderSingle, StreamRenderSize } from "./data"
import StreamViewDiv from "./StreamViewDiv"
import reactElementToVNode from "./ReactToSnabb"
import loadBackground from "./background"

const patch = init([
    propsModule, // for setting properties on DOM elements
    styleModule, // handles styling on elements with support for animations
])

let isRendering = false;
export function render(single: StreamRenderSingle, scale?: number): StreamRenderSize | null {
    if (isRendering) {
        return null
    }

    isRendering = true;
    try {
        const id = 'stream'
        let size: StreamRenderSize = undefined
        const streamElement = document.getElementById(id)
        const firstElement = streamElement.firstChild as HTMLElement
        if (firstElement) {
            size = {
                width: firstElement.offsetWidth,
                height: firstElement.offsetHeight
            }
        }

        // render
        const vNode = reactElementToVNode(StreamViewDiv({ id, size, single, scale }))
        if (firstElement) {
            // patch only first child to avoid flickering in background
            patch(firstElement, vNode.children[0] as VNode)
            Object.entries(vNode.data.style).forEach(([key, value]) => { streamElement.style[key] = value })
        } else {
            patch(streamElement, vNode)
        }

        // load background
        const newStreamElement = document.getElementById(id) // get it again after patch
        loadBackground(single.layout.backgroundType, newStreamElement, streamElement)

        return size
    } finally {
        isRendering = false;
    }
}
