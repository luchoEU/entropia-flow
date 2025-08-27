import { NavigateFunction } from "react-router-dom";
import { StreamComputedVariable, StreamRenderLayout, StreamSavedLayoutSet, StreamStateVariablesSet } from "../../../stream/data";
import { computeFormulas } from "../../../stream/formulaCompute";
import { formulaHelp } from "../../../stream/formulaParser";
import { RowValue } from "../../components/common/SortableTabularSection.data";
import { removeStreamLayout, removeStreamUser, restoreStreamLayout, setStreamStared, setStreamUserPartial } from "../actions/stream";
import { STREAM_TABULAR_CHOOSER, STREAM_TABULAR_IMAGES, STREAM_TABULAR_PARAMETERS, STREAM_TABULAR_TRASH, STREAM_TABULAR_VARIABLES } from "../state/stream";
import { TabularDefinitions, TabularRawData } from "../state/tabular";
import { navigateTo, streamEditorUrl } from "../actions/navigation";

interface StreamChooserLine {
    id: string,
    name: string,
    readonly: boolean,
    stared: boolean,
    layout: StreamRenderLayout
}

interface StreamTrashLine {
    id: string,
    name: string,
    layout: StreamRenderLayout
}

const streamTabularDataFromLayouts = (layouts: StreamSavedLayoutSet, trashLayouts: StreamSavedLayoutSet): TabularRawData<StreamChooserLine | StreamTrashLine> => ({
    [STREAM_TABULAR_CHOOSER]: {
        items: Object.entries(layouts).map(([id, layout]) => ({
            id,
            name: layout.name,
            readonly: !!layout.readonly,
            stared: !!layout.stared,
            layout
        })),
        data: {
            hasTrash: Object.keys(trashLayouts).length > 0,
        }
    },
    [STREAM_TABULAR_TRASH]: {
        items: Object.entries(trashLayouts).map(([id, layout]) => ({
            id,
            name: layout.name,
            layout
        }))
    }
});

interface StreamTabularVariablesFromVariablesData {
    layoutId: string,
    readonly: boolean
}

const streamTabularDataFromVariables = (variables: StreamStateVariablesSet, data: StreamTabularVariablesFromVariablesData): TabularRawData<StreamComputedVariable> => {
    const d: StreamComputedVariable[] =
        Object.entries(variables.single).map(([source, data]) => data.map(v => ({ source, ...v }))).flat()
    const noImages = d.filter(v => !v.isImage)
    const images = d.filter(v => v.isImage)
    const parameters = d.filter(v => v.isParameter)

    const obj = Object.fromEntries(noImages.map(v => [v.name, v.value]))
    obj.img = Object.fromEntries(images.map(v => [v.name, `img.${v.name}`]))
    const tObj = Object.fromEntries(Object.values(variables.temporal).flat().map(v => [v.name, v.value]))
    const computedObj = computeFormulas(obj, tObj)
    const tVariables = noImages.map(v => ({ ...v, computed: computedObj[v.name] }));
    return {
        [STREAM_TABULAR_VARIABLES]: { items: tVariables, data },
        [STREAM_TABULAR_IMAGES]: { items: images, data },
        [STREAM_TABULAR_PARAMETERS]: { items: parameters, data },
    }
}

const _field = (g: StreamComputedVariable, layoutId: string, selector: string, maxWidth: number, flag: Record<string, boolean> = {}): RowValue => {
    if (!flag.readonly && g.source === 'layout') {
        const w = { input: g[selector], width: maxWidth, dispatchChange: (v: string) => setStreamUserPartial(layoutId, g.id!, { [selector]: v }) }
        const img: RowValue =
            flag.addRemove && { img: 'img/cross.png', title: 'Remove variable', dispatch: () => removeStreamUser(layoutId, g.id!) } ||
            flag.formulaHelp && { text: 'i', class: 'img-txt-info', title: formulaHelp, width: 16 } || ''
        return img ? { sub: [ w, img ] } : w;
    } else if (maxWidth) {
        const v = g[selector];
        return { text: typeof v === 'string' ? v : JSON.stringify(v), maxWidth };
    } else {
        return g[selector];
    }
}

const streamTabularDefinitions: TabularDefinitions = {
    [STREAM_TABULAR_IMAGES]: {
        title: 'Images',
        subtitle: 'Available images ot use on template',
        columns: ['Source', 'Name', 'Image', 'Description'],
        getRow: (g: StreamComputedVariable, rowIndex: number, data: StreamTabularVariablesFromVariablesData): RowValue[] => {
            const layoutId = data?.layoutId ?? ''
            const img: RowValue = { img: g.value as string, title: `${g.name} image`, show: true, maxWidth: 100, style: { height: '90%', objectFit: 'contain', flex: 1 } }
            return [
                g.source,
                _field(g, layoutId, 'name', 100, { addRemove: true, readonly: data.readonly }),
                g.source === 'layout' && !data.readonly ? [ img, {
                    file: 'img/edit.png', dispatchChange: (value: string) => setStreamUserPartial(layoutId, g.id!, {value})
                }] : img,
                _field(g, layoutId, 'description', 300, { readonly: data.readonly }),
            ];
        },
        getRowKey: (g: StreamComputedVariable) => g.id,
        getRowForSort: (g: StreamComputedVariable) => [, g.name, g.value, g.description],
    },
    [STREAM_TABULAR_PARAMETERS]: {
        title: 'Parameters',
        subtitle: 'Available parameters of the layout',
        columns: ['Name', 'Value', 'Description'],
        getRow: (g: StreamComputedVariable, rowIndex: number, data: StreamTabularVariablesFromVariablesData): RowValue[] => {
            const layoutId = data?.layoutId ?? ''
            return [
                _field(g, layoutId, 'name', 100, { addRemove: true, readonly: data.readonly }),
                _field(g, layoutId, 'value', 100),
                _field(g, layoutId, 'description', 300, { readonly: data.readonly }),
            ]
        },
        getRowKey: (g: StreamComputedVariable) => g.id,
        getRowForSort: (g: StreamComputedVariable) => [g.name, g.value, g.description],
    },
    [STREAM_TABULAR_VARIABLES]: {
        title: 'Variables',
        subtitle: 'Available variables ot use on template',
        columns: ['Source', 'Name', 'Value', 'Description'],
        getRow: (g: StreamComputedVariable) => {
            const value = g.computed && typeof g.computed === 'string' ? g.computed : JSON.stringify(g.computed ?? g.value)
            return [
                g.source,
                g.name,
                [
                    { img: 'img/copy.png', title: 'Copy value to clipboard', clickPopup: 'Copied!', dispatch: () => { navigator.clipboard.writeText(value); return undefined } },
                    { text: value, title: typeof g.value === 'string' && g.value.startsWith('=') ? g.value : undefined, maxWidth: 800 }
                ],
                g.description ?? ''
            ]
        },
        getRowForSort: (g: StreamComputedVariable) => [, g.name, g.value, g.computed, g.description],
    },
    [STREAM_TABULAR_CHOOSER]: {
        title: 'Layouts',
        subtitle: 'Available layouts',
        columns: [ 'Name', 'Preview' ],
        getRow: (g: StreamChooserLine, i: number) => [
            [ g.name,
                { flex: 1 },
                { img: g.stared ? 'img/staron.png' : 'img/staroff.png', title: 'Set as default', show: true, dispatch: () => setStreamStared(g.id)(!g.stared) },
                { img: 'img/edit.png', title: 'Edit layout', dispatch: (n: NavigateFunction) => navigateTo(n, streamEditorUrl(g.id)) },
                { img: 'img/cross.png', title: 'Remove layout', dispatch: () => removeStreamLayout(g.id), visible: !g.readonly },
            ], {
                layout: g.layout, layoutId: g.id, id: `stream-chooser-${i}`, scale: 0.4, width: 200
            }],
        getRowForSort: (g: StreamChooserLine) => [g.name, ''],
    },
    [STREAM_TABULAR_TRASH]: {
        title: 'Trash',
        subtitle: 'Trash layouts',
        columns: [ 'Name', 'Preview' ],
        getRow: (g: StreamTrashLine, i: number) => [ 
            [ g.name,
                { flex: 1 },
                { img: 'img/recycle.png', title: 'Restore layout', show: true, class: 'img-btn-recycle', dispatch: () => restoreStreamLayout(g.id) },
            ], {
                layout: g.layout, layoutId: g.id, id: `stream-trash-${i}`, scale: 0.4, width: 200
            }],
        getRowForSort: (g: StreamTrashLine) => [g.name, ''],
    },
}

export {
    streamTabularDefinitions,
    streamTabularDataFromLayouts,
    streamTabularDataFromVariables,
}
