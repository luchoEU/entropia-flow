import { StreamRenderLayout, StreamRenderLayoutSet } from "../../../stream/data";
import { RowValue } from "../../components/common/SortableTabularSection.data";
import { removeStreamLayout, removeStreamUserVariable, setStreamEditing, setStreamStared, setStreamUserVariablePartial } from "../actions/stream";
import { STREAM_TABULAR_CHOOSER, STREAM_TABULAR_IMAGES, STREAM_TABULAR_VARIABLES, StreamVariable } from "../state/stream";
import { TabularDefinitions } from "../state/tabular";

interface StreamChooserLine {
    id: string,
    name: string,
    readonly: boolean,
    stared: boolean,
    layout: StreamRenderLayout
}

const streamTabularGetChooser = (layouts: StreamRenderLayoutSet): StreamChooserLine[] =>
    Object.entries(layouts).map(([id, layout]) => ({
        id,
        name: layout.name,
        readonly: !!layout.readonly,
        stared: !!layout.stared,
        layout
    }));

const _field = (g: StreamVariable, selector: string, maxWidth?: number, readonly?: boolean, addRemove?: boolean): RowValue => {
    if (!readonly && g.source === 'user') {
        const w = { input: g[selector], width: maxWidth, dispatchChange: (v: string) => setStreamUserVariablePartial(g.id, { [selector]: v }) }
        return addRemove ? { sub: [ w, { img: 'img/cross.png', title: 'Remove variable', dispatch: () => removeStreamUserVariable(g.id) } ] } : w;
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
        getRow: (g: StreamVariable) => [ g.source, g.name, { img: g.value as string, title: `${g.name} image`, show: true, style: { height: '90%' } }, { text: g.description, maxWidth: 300 } ],
    },
    [STREAM_TABULAR_VARIABLES]: {
        title: 'Variables',
        columns: ['Source', 'Name', 'Value', 'Computed', 'Description'],
        getRow: (g: StreamVariable) => [
            g.source,
            _field(g, 'name', 100, false, true),
            _field(g, 'value', 300),
            _field(g, 'computed', 120, true),
            _field(g, 'description', 300),
        ],
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
    streamTabularGetChooser
}
