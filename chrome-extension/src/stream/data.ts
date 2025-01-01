interface StreamRenderLayout {
    backgroundType: number // BackgroundType
    template: string
    containerStyle: string
    disableSafeCheck?: boolean
}

type StreamRenderLayoutSet = Record<string, StreamRenderLayout>

interface StreamRenderData {
    data: StreamRenderObject
    windows: string[]
    layouts: StreamRenderLayoutSet
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
    StreamRenderLayout,
    StreamRenderLayoutSet
}
