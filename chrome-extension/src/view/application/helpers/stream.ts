import { SHOW_STREAM_LAYOUTS_WITH_GAMELOG_DATA } from '../../../config';
import { BackgroundType } from '../../../stream/background'
import StreamRenderData, { StreamRenderLayout, StreamRenderLayoutSet } from '../../../stream/data';
import { LUCHO } from '../../components/about/AboutPage';
import { StreamState, StreamStateIn, StreamStateVariable, StreamTemporalVariable, StreamUserVariable } from "../state/stream";

const _defaultLayout: StreamRenderLayout = {
    name: 'Entropia Flow Default',
    author: LUCHO,
    backgroundType: BackgroundType.Ashfall,
    readonly: true,
    stared: true,
    htmlTemplate: `
<div class='root'>
  <img src='{{logoUrl}}' alt='Logo'></img>
  <div class='flexColumn column1'>
    <div class='title'>Entropia Flow</div>
    <div class='subtitle'>Chrome Extension</div>
  </div>
  <div class='flexColumn column2'>
    <div class='delta'>{{delta}} PED {{deltaWord}}</div>
    <div class='message'>{{message}}</div>
  </div>
</div>`.trimStart(),
    cssTemplate: `
.root {
  display: flex;
  align-items: start;
  font-size: 14px;
  margin: 30px;
}
.root > img { width: 50px; }
.flexColumn { display: flex; flex-direction: column; }
.column1 { margin: 0px 10px; }
.column2 { margin-left: 5px; width: 180px; }
.title { font-size: 20px; font-weight: bold; }
.subtitle { margin-left: 10px; }
.delta {
  background-color: {{deltaBackColor}};
  color: white;
  padding: 8px;
  border-radius: 8px;
  text-align: center;
}
.message {
  margin-top: 5px;
  font-size: 12px;
  text-align: center;
}`.trimStart(),
}

const _teamLootLayout: StreamRenderLayout = {
    name: 'Entropia Flow Team',
    author: LUCHO,
    backgroundType: BackgroundType.Matrix,
    readonly: true,
    htmlTemplate: `
<table>
  <thead><tr>
    <th></th>
    {{#team.players}}<th>{{.}}</th>{{/team.players}}
  </tr></thead>
  <tbody>
    {{#team.loot}}<tr>
      <td>{{name}}</td>
      {{#quantity}}<td>{{.}}</td>{{/quantity}}
  </tr>{{/team.loot}}</tbody>
</table>`.trimStart(),
    cssTemplate: `
table {
  border-collapse: collapse;
}
td, th {
  padding: 2px 5px;
  text-align: end;
}
td:nth-child(even), th:nth-child(even) {
  background-color: rgba(255,255,255,.15);
}`.trimStart(),
}

const DEFAULT_LAYOUT_ID = 'entropiaflow.default'
const TEAM_LAYOUT_ID = 'entropiaflow.team'

const initialStateIn: StreamStateIn = {
    enabled: true,
    advanced: false,
    defaultAuthor: undefined,
    view: [ DEFAULT_LAYOUT_ID ],
    layouts: {
        [DEFAULT_LAYOUT_ID]: _defaultLayout,
        ...SHOW_STREAM_LAYOUTS_WITH_GAMELOG_DATA ? {
            [TEAM_LAYOUT_ID]: _teamLootLayout,
        } : {}
    },
    userVariables: []
}

const initialState: StreamState = {
    in: initialStateIn,
    variables: { },
    temporalVariables: { },
    out: undefined
}

const reduceSetStreamState = (state: StreamState, newStateIn: StreamStateIn): StreamState => ({
    in: {
        ...newStateIn,
        layouts: {
            ...Object.fromEntries(Object.entries(newStateIn.layouts).map(([k, v]) => [k, { ...v, readonly: false }])),
            ...initialStateIn.layouts
        }
    },
    variables: state.variables,
    temporalVariables: state.temporalVariables,
    out: undefined
})

const reduceSetStreamEnabled = (state: StreamState, enabled: boolean) => ({
    ...state,
    in: {
        ...state.in,
        enabled
    }
})

const reduceSetStreamAdvanced = (state: StreamState, advanced: boolean) => ({
    ...state,
    in: {
        ...state.in,
        advanced
    }
})

const _changeStreamLayout = (state: StreamState, layoutId: string, partial: Partial<StreamRenderLayout>): StreamState => ({
    ...state,
    in: {
        ...state.in,
        layouts: {
            ...state.in.layouts,
            [layoutId]: {
                ...state.in.layouts[layoutId],
                ...partial
            }
        }
    }
})

const _changeEditingStreamLayout = (state: StreamState, partial: Partial<StreamRenderLayout>): StreamState => _changeStreamLayout(state, state.in.editing.layoutId, partial)

const reduceSetStreamAuthor = (state: StreamState, author: string): StreamState => ({
    ...state,
    in: {
        ...state.in,
        defaultAuthor: author,
        layouts: {
            ...state.in.layouts,
            [state.in.editing.layoutId]: {
                ...state.in.layouts[state.in.editing.layoutId],
                author
            }
        }
    }
})

const reduceSetStreamBackgroundSelected = (state: StreamState, layoutId: string, backgroundType: BackgroundType): StreamState => _changeStreamLayout(state, layoutId, { backgroundType })

const reduceSetStreamVariables = (state: StreamState, source: string, variables: StreamStateVariable[]): StreamState => ({
    ...state,
    variables: {
        ...state.variables,
        [source]: variables
    }
})

const reduceSetStreamTemporalVariables = (state: StreamState, source: string, variables: StreamTemporalVariable[]): StreamState => ({
    ...state,
    variables: {
        ...state.variables,
        [source]: variables.map(v => ({ name: v.name, value: { total: v.value.total.toFixed(v.decimals ?? 0), count: v.value.count }}))
    },
    temporalVariables: {
        ...state.temporalVariables,
        [source]: variables
    }
})

const reduceSetStreamHtmlTemplate = (state: StreamState, htmlTemplate: string): StreamState => _changeEditingStreamLayout(state, {
    htmlTemplate
})

const reduceSetStreamCssTemplate = (state: StreamState, cssTemplate: string): StreamState => _changeEditingStreamLayout(state, {
    cssTemplate
})

const reduceSetStreamEditing = (state: StreamState, layoutId: string): StreamState => ({
    ...state,
    in: {
        ...state.in,
        editing: layoutId === undefined ? undefined : { layoutId }
    }
})

const reduceSetStreamStared = (state: StreamState, layoutId: string, stared: boolean): StreamState => ({
    ...state,
    in: {
        ...state.in,
        layouts: Object.fromEntries(Object.entries(state.in.layouts).map(([id, layout]) => [id, id === layoutId ? { ...layout, stared } : layout])),
        view: stared ? [...state.in.view, layoutId] : state.in.view.filter(w => w !== layoutId)
    }
})

const reduceSetStreamName = (state: StreamState, name: string): StreamState => {
    const layouts = { ...state.in.layouts }
    delete layouts[state.in.editing.layoutId]
    const layoutId = _getUniqueLayoutId(layouts, name);
    layouts[layoutId] = { ...state.in.layouts[state.in.editing.layoutId], name };
    return {
        ...state,
        in: {
            ...state.in,
            editing: {
                layoutId
            },
            layouts
        }
    }
}

const reduceSetStreamData = (state: StreamState, data: StreamRenderData): StreamState => ({
    ...state,
    out: {
        ...state.out,
        data
    }
})

const _getUnique = (used: string[], base: string, noNumberName: string = undefined): string => {
    let n = 1;
    let name = noNumberName;
    while (!name || used.includes(name)) {
        name = `${base}${n++}`;
    }
    return name;
}

const _getUniqueLayoutId = (layouts: StreamRenderLayoutSet, name: string): string => {
    const baseId = (name.startsWith('entropiaflow.') ? `user.${name}` : name).replace(' ', '_');
    return _getUnique(Object.keys(layouts), `${baseId}_`, baseId);
}

const _getUniqueLayoutName = (layouts: StreamRenderLayoutSet, base: string, noNumberName?: string): string =>
    _getUnique(Object.values(layouts).map(l => l.name), base, noNumberName);

const reduceAddStreamLayout = (state: StreamState): StreamState => {
    const name = _getUniqueLayoutName(state.in.layouts, 'Layout ');
    const layoutId = _getUniqueLayoutId(state.in.layouts, name);
    return {
        ...state,
        in: {
            ...state.in,
            editing: {
                layoutId
            },
            layouts: {
                ...state.in.layouts,
                [layoutId]: {
                    name,
                    author: state.in.defaultAuthor,
                    backgroundType: _defaultLayout.backgroundType,
                    htmlTemplate: _defaultLayout.htmlTemplate,
                    cssTemplate: _defaultLayout.cssTemplate,
                }
            }
        }
    };
}


const reduceCloneStreamLayout = (state: StreamState): StreamState => {
    if (!state.in.editing?.layoutId) {
        return state;
    }

    const layout = state.in.layouts[state.in.editing.layoutId];
    const baseName = `${layout.name} copy`;
    const name = _getUniqueLayoutName(state.in.layouts, `${baseName} `, baseName);
    const layoutId = _getUniqueLayoutId(state.in.layouts, name);
    return {
        ...state,
        in: {
            ...state.in,
            editing: {
                layoutId
            },
            layouts: {
                ...state.in.layouts,
                [layoutId]: {
                    ...layout,
                    name,
                    author: state.in.defaultAuthor,
                    readonly: false,
                    stared: false
                }
            }
        }
    }
}

const reduceRemoveStreamLayout = (state: StreamState, layoutId: string): StreamState => {
    if (state.in.layouts[layoutId]?.readonly) {
        return state;
    }
    return {
        ...state,
        in: {
            ...state.in,
            layouts: Object.fromEntries(Object.entries(state.in.layouts).filter(([k, v]) => k !== layoutId)),
            view: state.in.view.filter(w => w !== layoutId)
        }
    }
}

const reduceAddStreamUserVariable = (state: StreamState, isImage: boolean): StreamState => ({
    ...state,
    in: {
        ...state.in,
        userVariables: [ ...state.in.userVariables, {
            id: state.in.userVariables?.length ? Math.max(...state.in.userVariables.map(v => v.id)) + 1 : 1,
            name: '',
            value: '',
            description: '',
            isImage
        } ]
    }
})

const reduceRemoveStreamUserVariable = (state: StreamState, id: number): StreamState => ({
    ...state,
    in: {
        ...state.in,
        userVariables: state.in.userVariables.filter(v => v.id !== id)
    }
})

const reduceSetStreamUserVariablePartial = (state: StreamState, id: number, partial: Partial<StreamUserVariable>): StreamState => ({
    ...state,
    in: {
        ...state.in,
        userVariables: state.in.userVariables.map(v => v.id === id ? { ...v, ...partial } : v)
    }
})

export {
    initialState,
    initialStateIn,
    DEFAULT_LAYOUT_ID,
    reduceSetStreamState,
    reduceSetStreamEnabled,
    reduceSetStreamAdvanced,
    reduceSetStreamBackgroundSelected,
    reduceSetStreamVariables,
    reduceSetStreamTemporalVariables,
    reduceSetStreamHtmlTemplate,
    reduceSetStreamCssTemplate,
    reduceSetStreamEditing,
    reduceSetStreamStared,
    reduceSetStreamData,
    reduceSetStreamName,
    reduceSetStreamAuthor,
    reduceAddStreamLayout,
    reduceAddStreamUserVariable,
    reduceRemoveStreamLayout,
    reduceRemoveStreamUserVariable,
    reduceSetStreamUserVariablePartial,
    reduceCloneStreamLayout,
}
