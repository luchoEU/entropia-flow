import { StreamUserImageVariable } from "../view/application/state/stream"

interface StreamRenderLayout {
    name: string,
    backgroundType: number // BackgroundType
    htmlTemplate?: string
    cssTemplate?: string
}

interface StreamCommonLayout extends StreamRenderLayout {
    author: string,
    lastModified: number,
    formulaJavaScript?: string
}

interface StreamSavedLayout extends StreamCommonLayout {
    images?: StreamUserImageVariable[]
    readonly?: boolean
    stared?: boolean
}

interface StreamExportLayout extends StreamCommonLayout {
    images?: Omit<StreamUserImageVariable, 'id'>[]
    schema: number
}

type StreamComputedLayoutData = {
    usedVariables?: string[]
}

type StreamComputedLayoutDataSet = Record<string, StreamComputedLayoutData> // id => layout
type StreamRenderLayoutSet = Record<string, StreamRenderLayout> // id => layout
type StreamSavedLayoutSet = Record<string, StreamSavedLayout> // id => layout

interface StreamPreRenderData {
    commonData: StreamRenderObject
    layoutData: Record<string, StreamRenderObject>
    layouts: StreamRenderLayoutSet,
}

interface StreamRenderData extends StreamPreRenderData {
    layoutIdList: string[]
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

export {
    StreamRenderData,
    StreamPreRenderData,
    StreamRenderLayout,
    StreamCommonLayout,
    StreamSavedLayout,
    StreamExportLayout,
    StreamRenderValue,
    StreamRenderObject,
    StreamRenderSingle,
    StreamRenderSize,
    StreamRenderLayoutSet,
    StreamComputedLayoutDataSet,
    StreamSavedLayoutSet
}
