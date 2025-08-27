import { TemporalValue } from "../common/state"

interface StreamBaseVariable<T> {
    name: string
    value: T
    description?: string
}

interface StreamUserImageVariable extends StreamBaseVariable<string> {
    id: number
}

interface StreamUserParameterVariable extends StreamBaseVariable<string> {
    id: number
}

interface StreamStateVariable extends StreamBaseVariable<StreamRenderValue> {
    isImage?: boolean
    isParameter?: boolean
}

interface StreamTemporalVariable extends StreamBaseVariable<TemporalValue> {
    decimals?: number
}

type StreamComputedVariable = (StreamUserImageVariable | StreamStateVariable) & {
    source: string
    id?: number
    computed?: StreamRenderValue
    isImage?: boolean
    isParameter?: boolean
}

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
    parameters?: StreamUserParameterVariable[]
    readonly?: boolean
    stared?: boolean
}

interface StreamExportLayout extends StreamCommonLayout {
    images?: Omit<StreamUserImageVariable, 'id'>[]
    parameters?: Omit<StreamUserParameterVariable, 'id'>[]
    schema: number
}

type StreamComputedLayoutData = {
    usedVariables?: string[]
}

type StreamComputedLayoutDataSet = Record<string, StreamComputedLayoutData> // id => layout
type StreamRenderLayoutSet = Record<string, StreamRenderLayout> // id => layout
type StreamSavedLayoutSet = Record<string, StreamSavedLayout> // id => layout

interface StreamStateVariablesSet
{
    single: Record<string, StreamStateVariable[]> // source => variables
    temporal: Record<string, StreamTemporalVariable[]> // source => variables
}

interface StreamRenderData {
    commonData: StreamRenderObject
    layoutData: Record<string, StreamRenderObject>
    layouts: StreamRenderLayoutSet,
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
    StreamBaseVariable,
    StreamStateVariable,
    StreamUserImageVariable,
    StreamTemporalVariable,
    StreamComputedVariable,
    StreamRenderData,
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
    StreamSavedLayoutSet,
    StreamStateVariablesSet,
}
