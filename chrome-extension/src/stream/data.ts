interface StreamBaseLayout {
    name: string,
    author: string,
    lastModified: number,
    backgroundType: number // BackgroundType
    formulaJavaScript?: string
    htmlTemplate?: string
    cssTemplate?: string
}

interface StreamRenderLayout extends StreamBaseLayout {
    readonly?: boolean
    stared?: boolean
}

export interface StreamExportLayout extends StreamBaseLayout {
    schema: number,
    variables: {
        name: string,
        value: string,
        description: string,
        isImage: boolean
    }[]
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
    StreamBaseLayout,
    StreamRenderValue,
    StreamRenderObject,
    StreamRenderSingle,
    StreamRenderSize,
    StreamRenderLayout,
    StreamRenderLayoutSet
}
