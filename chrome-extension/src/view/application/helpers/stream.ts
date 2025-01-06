import { BackgroundType } from '../../../stream/background'
import StreamRenderData, { StreamRenderLayout, StreamRenderLayoutSet } from '../../../stream/data';
import { StreamState, StreamStateIn, StreamVariable } from "../state/stream";

const _defaultLayout: StreamRenderLayout = {
    name: 'Entropia Flow Default',
    backgroundType: BackgroundType.Ashfall,
    readonly: true,
    stared: true,
    htmlTemplate: `
<div style='display: flex; align-items: start; font-size: 14px; margin: 50px;'>
  <img style='width: 50px;' src='{{logoUrl}}' alt='Logo'></img>
  <div style='display: flex; flex-direction: column; margin: 0px 10px;'>
    <div style='font-size: 20px; font-weight: bold;'>Entropia Flow</div>
    <div style='margin-left: 10px'>Chrome Extension</div>
  </div>
  <div style='display: flex; flex-direction: column; margin-left: 5px; width: 180px;'>
    <div style='background-color: {{deltaBackColor}}; color: white; padding: 8px; border-radius: 8px; text-align: center;'>
      {{delta}} PED {{deltaWord}}
    </div>
    <div style='margin-top: 5px; font-size: 12px; text-align: center;'>{{message}}</div>
  </div>
</div>`.trimStart(),
}

const _teamLootLayout: StreamRenderLayout = {
    name: 'Entropia Flow Team',
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

const initialStateIn: StreamStateIn = {
    enabled: true,
    windows: [ 'entropiaflow.default' ],
    layouts: {
        ['entropiaflow.default']: _defaultLayout,
        ['entropiaflow.team']: _teamLootLayout,
    },
    userVariables: []
}

const initialState: StreamState = {
    in: initialStateIn,
    variables: { },
    out: undefined
}

const reduceSetStreamState = (state: StreamState, newStateIn: StreamStateIn): StreamState => ({
    in: {
        ...newStateIn,
        layouts: {
            ...newStateIn.layouts,
            ...initialStateIn.layouts
        }
    },
    variables: state.variables,
    out: undefined
})

const reduceSetStreamEnabled = (state: StreamState, enabled: boolean) => ({
    ...state,
    in: {
        ...state.in,
        enabled
    }
})

const _changeStreamLayout = (state: StreamState, partial: Partial<StreamRenderLayout>): StreamState => ({
    ...state,
    in: {
        ...state.in,
        layouts: {
            ...state.in.layouts,
            [state.in.editing.layoutId]: {
                ...state.in.layouts[state.in.editing.layoutId],
                ...partial
            }
        }
    }
})

const reduceSetStreamBackgroundSelected = (state: StreamState, selected: BackgroundType): StreamState => _changeStreamLayout(state, {
    backgroundType: selected
})

const reduceSetStreamVariables = (state: StreamState, source: string, variables: StreamVariable[]): StreamState => ({
    ...state,
    variables: {
        ...state.variables,
        [source]: variables
    }
})

const reduceSetStreamHtmlTemplate = (state: StreamState, htmlTemplate: string): StreamState => _changeStreamLayout(state, {
    htmlTemplate
})

const reduceSetStreamCssTemplate = (state: StreamState, cssTemplate: string): StreamState => _changeStreamLayout(state, {
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
        windows: stared ? [...state.in.windows, layoutId] : state.in.windows.filter(w => w !== layoutId)
    }
})

const reduceSetStreamName = (state: StreamState, name: string): StreamState => {
    const layouts = { ...state.in.layouts }
    delete layouts[state.in.editing.layoutId]
    const baseId = name.startsWith('entropiaflow.') ? `user.${name}` : name;
    const layoutId = getUniqueLayoutId(layouts, `${baseId}_`)
    layouts[layoutId] = { ...state.in.layouts[state.in.editing.layoutId], name }
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

const getUniqueLayoutId = (layouts: StreamRenderLayoutSet, baseId: string, tryNoNumber: boolean = false): string => {
    let n = 1;
    let layoutId = tryNoNumber ? baseId : undefined
    while (layouts[layoutId]) {
        layoutId = `${baseId}${n++}`;
    }
    return layoutId
}

const reduceAddStreamLayout = (state: StreamState): StreamState => {
    const layoutId = getUniqueLayoutId(state.in.layouts, 'Layout ');
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
                    ..._defaultLayout,
                    name: layoutId
                }
            }
        }
    };
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
            windows: state.in.windows.filter(w => w !== layoutId)
        }
    }
}

const reduceAddStreamUserVariable = (state: StreamState): StreamState => ({
    ...state,
    in: {
        ...state.in,
        userVariables: [ ...state.in.userVariables, {
            id: Math.max(...state.in.userVariables.map(v => v.id)) + 1,
            name: '',
            value: '',
            description: '',
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

const reduceSetStreamUserVariablePartial = (state: StreamState, id: number, partial: Partial<StreamVariable>): StreamState => ({
    ...state,
    in: {
        ...state.in,
        userVariables: state.in.userVariables.map(v => v.id === id ? { ...v, ...partial } : v)
    }
})

export {
    initialState,
    initialStateIn,
    reduceSetStreamState,
    reduceSetStreamEnabled,
    reduceSetStreamBackgroundSelected,
    reduceSetStreamVariables,
    reduceSetStreamHtmlTemplate,
    reduceSetStreamCssTemplate,
    reduceSetStreamEditing,
    reduceSetStreamStared,
    reduceSetStreamData,
    reduceSetStreamName,
    reduceAddStreamLayout,
    reduceRemoveStreamLayout,
    reduceAddStreamUserVariable,
    reduceRemoveStreamUserVariable,
    reduceSetStreamUserVariablePartial,
}
