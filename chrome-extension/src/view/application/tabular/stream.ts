import { StreamRenderLayout, StreamRenderLayoutSet } from "../../../stream/data";
import { formulaHelp } from "../../../stream/formulaParser";
import { computeFormulas } from "../../../stream/template";
import { RowValue } from "../../components/common/SortableTabularSection.data";
import { removeStreamLayout, removeStreamUserVariable, setStreamEditing, setStreamStared, setStreamUserVariablePartial } from "../actions/stream";
import { STREAM_TABULAR_CHOOSER, STREAM_TABULAR_IMAGES, STREAM_TABULAR_VARIABLES, StreamVariable } from "../state/stream";
import { TabularDefinitions, TabularRawData } from "../state/tabular";

interface StreamChooserLine {
    id: string,
    name: string,
    readonly: boolean,
    stared: boolean,
    layout: StreamRenderLayout
}

const streamTabularDataFromLayouts = (layouts: StreamRenderLayoutSet): TabularRawData<StreamChooserLine> => ({
    [STREAM_TABULAR_CHOOSER]:
        Object.entries(layouts).map(([id, layout]) => ({
            id,
            name: layout.name,
            readonly: !!layout.readonly,
            stared: !!layout.stared,
            layout
        }))
});

const streamTabularDataFromVariables = (variables: Record<string, StreamVariable[]>): TabularRawData<StreamVariable> => {
    const d: StreamVariable[] =
        Object.entries(variables).map(([source, data]) => data.map(v => ({ source, ...v }))).flat()
    const noImages = d.filter(v => !v.isImage)
    const images = d.filter(v => v.isImage)

    const obj = Object.fromEntries(noImages.map(v => [v.name, v.value]))
    obj.img = Object.fromEntries(images.map(v => [v.name, `img.${v.name}`]))
    const computedObj = computeFormulas(obj)
    const tVariables = noImages.map(v => ({ ...v, computed: computedObj[v.name] }))
    
    return {
        [STREAM_TABULAR_VARIABLES]: tVariables,
        [STREAM_TABULAR_IMAGES]: images
    }
}

const _field = (g: StreamVariable, selector: string, maxWidth: number, flag: Record<string, boolean> = {}): RowValue => {
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
        columns: ['Source', 'Name', 'Image', 'Description'],
        getRow: (g: StreamVariable): RowValue[] => {
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
        getRowForSort: (g: StreamVariable) => [, g.name, g.value, g.description],
    },
    [STREAM_TABULAR_VARIABLES]: {
        title: 'Variables',
        columns: ['Source', 'Name', 'Value', 'Computed', 'Description'],
        getRow: (g: StreamVariable) => [
            g.source,
            _field(g, 'name', 100, { addRemove: true }),
            _field(g, 'value', 300, { formulaHelp: true }),
            _field(g, 'computed', 120, { readonly: true}),
            _field(g, 'description', 300),
        ],
        getRowForSort: (g: StreamVariable) => [, g.name, g.value, g.computed, g.description],
    },
    [STREAM_TABULAR_CHOOSER]: {
        title: 'Layouts',
        columns: [ 'Name', 'Preview' ],
        getRow: (g: StreamChooserLine, i: number) => [
            [ g.name,
                { flex: 1 },
                { img: g.stared ? 'img/staron.png' : 'img/staroff.png', title: 'Set as default', show: true, dispatch: () => setStreamStared(g.id, !g.stared) },
                { img: 'img/edit.png', title: 'Edit', dispatch: () => setStreamEditing(g.id) },
                { img: 'img/cross.png', title: 'Remove', dispatch: () => removeStreamLayout(g.id), visible: !g.readonly },
            ], {
                layout: g.layout, layoutId: g.id, id: `stream-chooser-${i}`, scale: 0.4, width: 200
            }],
    }
}

export {
    streamTabularDefinitions,
    streamTabularDataFromLayouts,
    streamTabularDataFromVariables,
}