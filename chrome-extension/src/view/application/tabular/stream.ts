import { NavigateFunction } from "react-router-dom";
import { StreamRenderLayout, StreamRenderLayoutSet } from "../../../stream/data";
import { computeFormulas } from "../../../stream/formulaCompute";
import { formulaHelp } from "../../../stream/formulaParser";
import { RowValue } from "../../components/common/SortableTabularSection.data";
import { removeStreamLayout, removeStreamUserVariable, setStreamStared, setStreamUserVariablePartial } from "../actions/stream";
import { STREAM_TABULAR_CHOOSER, STREAM_TABULAR_IMAGES, STREAM_TABULAR_VARIABLES, StreamComputedVariable, StreamStateVariable, StreamTemporalVariable } from "../state/stream";
import { TabularDefinitions, TabularRawData } from "../state/tabular";
import { navigateTo, streamEditorUrl } from "../actions/navigation";

interface StreamChooserLine {
    id: string,
    name: string,
    readonly: boolean,
    stared: boolean,
    layout: StreamRenderLayout
}

const streamTabularDataFromLayouts = (layouts: StreamRenderLayoutSet): TabularRawData<StreamChooserLine> => ({
    [STREAM_TABULAR_CHOOSER]: {
        items: Object.entries(layouts).map(([id, layout]) => ({
            id,
            name: layout.name,
            readonly: !!layout.readonly,
            stared: !!layout.stared,
            layout
        }))
    }
});

const streamTabularDataFromVariables = (variables: Record<string, StreamStateVariable[]>, temporalVariables: Record<string, StreamTemporalVariable[]>): TabularRawData<StreamComputedVariable> => {
    const d: StreamComputedVariable[] =
        Object.entries(variables).map(([source, data]) => data.map(v => ({ source, ...v }))).flat()
    const noImages = d.filter(v => !v.isImage)
    const images = d.filter(v => v.isImage)

    const obj = Object.fromEntries(noImages.map(v => [v.name, v.value]))
    obj.img = Object.fromEntries(images.map(v => [v.name, `img.${v.name}`]))
    const tObj = Object.fromEntries(Object.values(temporalVariables).flat().map(v => [v.name, v.value]))
    const computedObj = computeFormulas(obj, tObj)
    const tVariables = noImages.map(v => ({ ...v, computed: computedObj[v.name] }));
    return {
        [STREAM_TABULAR_VARIABLES]: { items: tVariables },
        [STREAM_TABULAR_IMAGES]: { items: images }
    }
}

const _field = (g: StreamComputedVariable, selector: string, maxWidth: number, flag: Record<string, boolean> = {}): RowValue => {
    if (!flag.readonly && g.source === 'user') {
        const w = { input: g[selector], width: maxWidth, dispatchChange: (v: string) => setStreamUserVariablePartial(g.id, { [selector]: v }) }
        const img: RowValue =
            flag.addRemove && { img: 'img/cross.png', title: 'Remove variable', dispatch: () => removeStreamUserVariable(g.id) } ||
            flag.formulaHelp && { text: 'i', class: 'img-info', title: formulaHelp, width: 16 }
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
        getRow: (g: StreamComputedVariable): RowValue[] => {
            const img: RowValue = { img: g.value as string, title: `${g.name} image`, show: true, maxWidth: 100, style: { height: '90%', objectFit: 'contain', flex: 1 } }
            return [
                g.source,
                _field(g, 'name', 100, { addRemove: true }),
                g.source === 'user' ? [ img, {
                    file: 'img/edit.png', dispatchChange: (value: string) => setStreamUserVariablePartial(g.id, {value})
                }] : img,
                _field(g, 'description', 300),
            ];
        },
        getRowForSort: (g: StreamComputedVariable) => [, g.name, g.value, g.description],
    },
    [STREAM_TABULAR_VARIABLES]: {
        title: 'Variables',
        subtitle: 'Available variables ot use on template',
        columns: ['Source', 'Name', 'Value', 'Computed', 'Description'],
        getRow: (g: StreamComputedVariable) => [
            g.source,
            _field(g, 'name', 100, { addRemove: true }),
            _field(g, 'value', 300, { formulaHelp: true }),
            _field(g, 'computed', 120, { readonly: true}),
            _field(g, 'description', 300),
        ],
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
                { img: 'img/edit.png', title: 'Edit', dispatch: (n: NavigateFunction) => navigateTo(n, streamEditorUrl(g.id)) },
                { img: 'img/cross.png', title: 'Remove', dispatch: () => removeStreamLayout(g.id), visible: !g.readonly },
            ], {
                layout: g.layout, layoutId: g.id, id: `stream-chooser-${i}`, scale: 0.4, width: 200
            }],
        getRowForSort: (g: StreamChooserLine) => [g.name, ''],
    }
}

export {
    streamTabularDefinitions,
    streamTabularDataFromLayouts,
    streamTabularDataFromVariables,
}
