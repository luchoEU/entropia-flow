import { HtmlTemplateData, HtmlTemplateIndirectData } from "./htmlTemplate"

interface StreamRenderData {
    backgroundType: number // BackgroundType
    templateName: string,
    variables: StreamRenderVariables
    templateDefinition?: {
        data?: HtmlTemplateData
        indirect?: HtmlTemplateIndirectData[]
        indirectNames?: string[]
    }
}

type StreamRenderVariables = Record<string, string>

interface StreamRenderSize {
    width: number,
    height: number
}

export default StreamRenderData
export {
    StreamRenderVariables,
    StreamRenderSize
}
