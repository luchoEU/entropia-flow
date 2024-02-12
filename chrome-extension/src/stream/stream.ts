import { BackgroundType, getIcon, loadBackground } from "./background"
import { init, propsModule, styleModule } from 'snabbdom'
import StreamViewDiv from "./StreamViewDiv"
import reactElementToVNode from "./ReactToSnabb"

// size in pixels needed for the window
interface SizeData {
    width: number,
    height: number
}

const patch = init([
    propsModule, // for setting properties on DOM elements
    styleModule, // handles styling on elements with support for animations
])

export function render(containerId: string, data: any): SizeData {
    var streamElement = document.getElementById('stream')

    const dataToRender = {
        ...data,
        logoSrc: getIcon(BackgroundType.Ashfall),
    }
    const vNode = reactElementToVNode(StreamViewDiv(dataToRender))
    patch(streamElement, vNode)

    loadBackground(BackgroundType.Ashfall, streamElement)

    return {
        width: parseInt(streamElement.style.width),
        height: parseInt(streamElement.style.height)
    }
}
