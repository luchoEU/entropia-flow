import { ADD_CLIENT_INITIAL_LAYOUTS } from '../../../config';
import { BackgroundType } from '../../../stream/background'
import StreamRenderData, { StreamBaseLayout, StreamExportLayout, StreamRenderLayout } from '../../../stream/data';
import { filterUsedVariables } from '../../../stream/formulaCompute';
import { getUsedVariablesInTemplate } from '../../../stream/template';
import { LUCHO } from '../../components/about/AboutPage';
import { StreamState, StreamStateIn, StreamStateVariable, StreamTemporalVariable, StreamUserVariable } from "../state/stream";

const _defaultLayout: StreamRenderLayout = {
    name: 'Entropia Flow Default',
    author: LUCHO,
    lastModified: new Date('Sat Jan 18 10:27:20 2025 +0100').getTime(),
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
    lastModified: new Date('Mon Jan 6 19:04:52 2025 +0100').getTime(),
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
    advanced: false,
    defaultAuthor: undefined,
    view: [ DEFAULT_LAYOUT_ID ],
    layouts: {
        [DEFAULT_LAYOUT_ID]: _defaultLayout,
        ...ADD_CLIENT_INITIAL_LAYOUTS ? {
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
            ...Object.fromEntries(Object.entries(initialStateIn.layouts).map(([k, v]) => [k, { ...v, backgroundType: newStateIn.layouts[k].backgroundType ?? v.backgroundType }])),
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
                ...partial,
                lastModified: Date.now()
            }
        }
    }
})

const reduceSetStreamAuthor = (state: StreamState, layoutId: string, author: string): StreamState => ({
    ...state,
    in: {
        ...state.in,
        defaultAuthor: author,
        layouts: {
            ...state.in.layouts,
            [layoutId]: {
                ...state.in.layouts[layoutId],
                author,
                lastModified: Date.now()
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

const reduceSetStreamHtmlTemplate = (state: StreamState, layoutId: string, htmlTemplate: string): StreamState => _changeStreamLayout(state, layoutId, { htmlTemplate })

const reduceSetStreamCssTemplate = (state: StreamState, layoutId: string, cssTemplate: string): StreamState => _changeStreamLayout(state, layoutId, { cssTemplate })

const reduceSetStreamStared = (state: StreamState, layoutId: string, stared: boolean): StreamState => ({
    ...state,
    in: {
        ...state.in,
        layouts: Object.fromEntries(Object.entries(state.in.layouts).map(([id, layout]) => [id, id === layoutId ? { ...layout, stared } : layout])),
        view: stared ? [...state.in.view, layoutId] : state.in.view.filter(w => w !== layoutId)
    }
})

const reduceSetStreamName = (state: StreamState, layoutId: string, newLayoutId: string, name: string): StreamState => {
    const layouts = { ...state.in.layouts }
    if (layoutId !== newLayoutId) {
        delete layouts[layoutId]
    }
    layouts[newLayoutId] = { ...state.in.layouts[layoutId], name, lastModified: Date.now() };
    return {
        ...state,
        in: {
            ...state.in,
            layouts,
            layoutAlias: { urlLayoutId: state.in.layoutAlias?.urlLayoutId ?? layoutId, realLayoutId: newLayoutId }
        }
    }
}

const reduceClearStreamLayoutAlias = (state: StreamState): StreamState => ({
    ...state,
    in: {
        ...state.in,
        layoutAlias: undefined
    }
})

const reduceSetStreamData = (state: StreamState, data: StreamRenderData): StreamState => ({
    ...state,
    out: {
        ...state.out,
        data
    }
})

const reduceAddStreamLayout = (state: StreamState, layoutId: string, name: string): StreamState => ({
    ...state,
    in: {
        ...state.in,
        layouts: {
            ...state.in.layouts,
            [layoutId]: {
                name,
                lastModified: Date.now(),
                author: state.in.defaultAuthor,
                backgroundType: _defaultLayout.backgroundType,
                htmlTemplate: _defaultLayout.htmlTemplate,
                cssTemplate: _defaultLayout.cssTemplate,
            }
        }
    }
});

const reduceImportStreamLayoutFromFile = (state: StreamState, layoutId: string, layout: StreamExportLayout): StreamState => {
    return {
        ...state,
        in: {
            ...state.in,
            layouts: {
                ...state.in.layouts,
                [layoutId]: exportToRenderLayout(layout)
            },
            userVariables: state.in.userVariables
        }
    }
}

const reduceCloneStreamLayout = (state: StreamState, layoutId: string, newLayoutId: string, newName: string): StreamState => {
    const layout = state.in.layouts[layoutId];
    if (!layout) {
        return state;
    }

    return {
        ...state,
        in: {
            ...state.in,
            layouts: {
                ...state.in.layouts,
                [newLayoutId]: {
                    ...layout,
                    name: newName,
                    lastModified: Date.now(),
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

const _nextUserVariableId = (state: StreamState): number => state.in.userVariables?.length ? Math.max(...state.in.userVariables.map(v => v.id)) + 1 : 1

const reduceAddStreamUserVariable = (state: StreamState, isImage: boolean): StreamState => ({
    ...state,
    in: {
        ...state.in,
        userVariables: [ ...state.in.userVariables, {
            id: _nextUserVariableId(state),
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

function renderToExportLayout(layout: StreamRenderLayout, variables: StreamUserVariable[]): StreamExportLayout {
    const usedVariablesHtml = getUsedVariablesInTemplate(layout.htmlTemplate)
    const usedVariablesCss = getUsedVariablesInTemplate(layout.cssTemplate)
    const usedVariables = new Set([...usedVariablesHtml, ...usedVariablesCss])
    const exportableData: StreamExportLayout = {
        schema: 1,
        ...copyBaseLayout(layout),
        variables: filterUsedVariables(variables, usedVariables).map(v => ({
            name: v.name,
            value: v.value,
            description: v.description,
            isImage: v.isImage
        }))
    }
    return exportableData
}

const copyBaseLayout = (layout: StreamBaseLayout): StreamBaseLayout => ({
    name: layout.name,
    author: layout.author,
    lastModified: layout.lastModified,
    backgroundType: layout.backgroundType,
    htmlTemplate: layout.htmlTemplate,
    cssTemplate: layout.cssTemplate,
})

const exportToRenderLayout = copyBaseLayout

const exportToUserVariables = (layout: StreamExportLayout, id: number): StreamUserVariable[] => {
    const variables: StreamUserVariable[] = []
    for (const v of layout.variables) {
        variables.push({ ...v, id })
        id++
    }
    return variables
}

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
    reduceSetStreamStared,
    reduceSetStreamData,
    reduceSetStreamName,
    reduceSetStreamAuthor,
    reduceAddStreamLayout,
    reduceImportStreamLayoutFromFile,
    reduceAddStreamUserVariable,
    reduceRemoveStreamLayout,
    reduceRemoveStreamUserVariable,
    reduceSetStreamUserVariablePartial,
    reduceCloneStreamLayout,
    reduceClearStreamLayoutAlias,
    renderToExportLayout,
}
