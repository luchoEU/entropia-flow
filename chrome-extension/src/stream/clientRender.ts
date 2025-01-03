import { init, propsModule, styleModule, VNode } from 'snabbdom'
import { StreamRenderSingle } from "./data"
import StreamViewDiv from "./StreamViewDiv"
import reactElementToVNode from "./ReactToSnabb"
import loadBackground from "./background"

const patch = init([
    propsModule, // for setting properties on DOM elements
    styleModule, // handles styling on elements with support for animations
])

interface StreamRenderSize {
    width: number,
    height: number
}

let isRendering = false;
export function render(data: StreamRenderSingle): StreamRenderSize | null {
    if (isRendering) {
        return null
    }

    isRendering = true;
    try {
        const streamElement = document.getElementById('stream')

        // render
        const vNode = reactElementToVNode(StreamViewDiv({ id: 'stream', data }))
        if (streamElement.firstChild) {
            // patch only first child to avoid flickering in background
            patch(streamElement.firstChild as HTMLElement, vNode.children[0] as VNode)
            Object.entries(vNode.data.style).forEach(([key, value]) => { streamElement.style[key] = value })
        } else {
            patch(streamElement, vNode)
        }

        // load background
        const newStreamElement = document.getElementById('stream') // get it again after patch
        loadBackground(data.layout.backgroundType, newStreamElement, streamElement)

        return {
            width: newStreamElement.offsetWidth,
            height: newStreamElement.offsetHeight
        }
    } finally {
        isRendering = false;
    }
}
