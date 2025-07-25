import { StreamCommonLayout, StreamExportLayout, StreamRenderLayout, StreamSavedLayout } from "./data"

const savedToExportLayout = (layout: StreamSavedLayout): StreamExportLayout => ({
    schema: 1,
    ...copyCommonLayout(layout),
    images: layout.images?.map(v => ({
        name: v.name,
        value: v.value,
        description: v.description?.length ? v.description : undefined
    }))
})

const exportToSavedLayout = (layout: StreamExportLayout): StreamSavedLayout => ({
    ...copyCommonLayout(layout),
    images: layout.images?.map((v, i) => ({
        id: i,
        name: v.name,
        value: v.value,
        description: v.description
    }))
})

const savedToRenderLayout = (layout: StreamSavedLayout): StreamRenderLayout => ({
    name: layout.name,
    backgroundType: layout.backgroundType,
    htmlTemplate: layout.htmlTemplate,
    cssTemplate: layout.cssTemplate,
})

const copyCommonLayout = (layout: StreamCommonLayout): StreamCommonLayout => ({
    name: layout.name,
    author: layout.author,
    lastModified: layout.lastModified,
    backgroundType: layout.backgroundType,
    formulaJavaScript: layout.formulaJavaScript,
    htmlTemplate: layout.htmlTemplate,
    cssTemplate: layout.cssTemplate,
})

export {
    savedToExportLayout,
    exportToSavedLayout,
    savedToRenderLayout,
}