interface StreamRenderLayout {
    name: string,
    backgroundType: number // BackgroundType
    htmlTemplate: string
    cssTemplate?: string
    readonly?: boolean
    stared?: boolean
}

type StreamRenderLayoutSet = Record<string, StreamRenderLayout> // id => layout

interface StreamRenderData {
    data: StreamRenderObject
    layouts: StreamRenderLayoutSet
}

interface StreamRenderSize {
    width: number,
    height: number
}

interface StreamRenderSingle {
    data: StreamRenderObject
    layout: StreamRenderLayout
}

type StreamRenderObject = { [name: string]: StreamRenderValue }
type StreamRenderValue = string | number | boolean | StreamRenderObject | StreamRenderValue[]

export default StreamRenderData
export {
    StreamRenderValue,
    StreamRenderObject,
    StreamRenderSingle,
    StreamRenderSize,
    StreamRenderLayout,
    StreamRenderLayoutSet
}
