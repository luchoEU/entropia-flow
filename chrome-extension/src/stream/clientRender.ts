import { init, propsModule, styleModule } from 'snabbdom'
import StreamRenderData, { StreamRenderSize } from "./data"
import StreamViewDiv from "./StreamViewDiv"
import reactElementToVNode from "./reactToSnabb"
import loadBackground from "./background"

const patch = init([
    propsModule, // for setting properties on DOM elements
    styleModule, // handles styling on elements with support for animations
])

let isRendering = false;
export function render(data: StreamRenderData): StreamRenderSize | null {
    if (isRendering) {
        return null
    }

    isRendering = true;
    try {
        const streamElement = document.getElementById('stream')

        // update template definition

        // render
        const vNode = reactElementToVNode(StreamViewDiv({ data }))
        patch(streamElement, vNode)

        // load background
        const newStreamElement = document.getElementById('stream') // get it again after patch
        loadBackground(data.def.backgroundType, newStreamElement, streamElement)

        return data.def.size
    } finally {
        isRendering = false;
    }
}
