import { BackgroundType, loadBackground } from "./background"
import { init, propsModule, styleModule } from 'snabbdom'
import StreamViewDiv from "./StreamViewDiv"
import reactElementToVNode from "./reactToSnabb"

// size in pixels needed for the window
interface SizeData {
    width: number,
    height: number
}

const patch = init([
    propsModule, // for setting properties on DOM elements
    styleModule, // handles styling on elements with support for animations
])

let isRendering = false;
export function render(data: any): SizeData | null {
    if (isRendering) {
        return null
    }

    isRendering = true;
    try {
        const streamElement = document.getElementById('stream')

        const vNode = reactElementToVNode(StreamViewDiv(data))
        patch(streamElement, vNode)

        const newStreamElement = document.getElementById('stream') // get it again after patch
        loadBackground(data.background, newStreamElement, streamElement)

        return {
            width: parseInt(streamElement.style.width),
            height: parseInt(streamElement.style.height)
        }
    } finally {
        isRendering = false;
    }
}
