interface StreamRenderDefinition {
    backgroundType: number // BackgroundType
    template: string
    size: StreamRenderSize
}

interface StreamRenderSize {
    width: number
    height: number
}

interface StreamRenderData {
    obj: StreamRenderObject
    def: StreamRenderDefinition
}

type StreamRenderObject = { [name: string]: StreamRenderValue }
type StreamRenderValue = string | number | boolean | StreamRenderObject | StreamRenderValue[]

export default StreamRenderData
export {
    StreamRenderDefinition,
    StreamRenderObject,
    StreamRenderValue,
    StreamRenderSize
}
