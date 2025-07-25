import { BackgroundType } from '../../../stream/background'
import { StreamExportLayout, StreamPreRenderData, StreamSavedLayout } from '../../../stream/data';
import { exportToSavedLayout } from '../../../stream/data.convert';
import { StreamState, StreamStateIn, StreamStateVariable, StreamTemporalVariable, StreamUserImageVariable } from "../state/stream";
import defaultLayout from './layout/default.entropiaflow.layout.json'
import huntLayout from './layout/hunt.entropiaflow.layout.json'
import teamLayout from './layout/team.entropiaflow.layout.json'
import lootLayout from './layout/loot.entropiaflow.layout.json'
import { getUsedVariablesInTemplateList } from '../../../stream/template';

function loadBuiltinLayout(layout: StreamExportLayout, stared: boolean = false): StreamSavedLayout {
    return {
        ...exportToSavedLayout(layout),
        readonly: true,
        stared,
    }
}

const initialStateIn: StreamStateIn = {
    advanced: false,
    defaultAuthor: undefined!,
    view: [ 'entropiaflow.default' ],
    layouts: {
        ['entropiaflow.default']: loadBuiltinLayout(defaultLayout),
        ['entropiaflow.hunt']: loadBuiltinLayout(huntLayout),
        ['entropiaflow.team']: loadBuiltinLayout(teamLayout),
        ['entropiaflow.loot']: loadBuiltinLayout(lootLayout),
    },
    trashLayouts: {},
}

const initialState: StreamState = {
    in: initialStateIn,
    variables: { },
    temporalVariables: { },
    ui: {},
    client: {},
    out: undefined!
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
    ui: {},
    client: {},
    out: undefined!
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

const _changeStreamLayout = (state: StreamState, layoutId: string, partial: Partial<StreamSavedLayout>): StreamState => ({
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

const _computeUsedVariables = (state: StreamState, layoutId: string): StreamState => {
    const layout = state.in.layouts[layoutId];
    if (!layout) {
        return state;
    }
    return {
        ...state,
        out: {
            ...state.out,
            computed: {
                ...state.out.computed,
                [layoutId]: {
                    usedVariables: getUsedVariablesInTemplateList([layout.htmlTemplate, layout.cssTemplate]),
                }
            }
        }
    }
}

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
        [source]: variables as any
    },
    temporalVariables: {
        ...state.temporalVariables,
        [source]: variables
    }
})

const reduceSetStreamFormulaJavaScript = (state: StreamState, layoutId: string, formulaJavaScript: string): StreamState => _changeStreamLayout(state, layoutId, { formulaJavaScript })

const reduceSetStreamShowingLayoutId = (state: StreamState, layoutId: string): StreamState => ({
    ...state,
    ui: {
        ...state.ui,
        showingLayoutId: layoutId
    }
})

const reduceSetStreamHtmlTemplate = (state: StreamState, layoutId: string, htmlTemplate: string): StreamState => _computeUsedVariables(_changeStreamLayout(state, layoutId, { htmlTemplate }), layoutId)

const reduceSetStreamCssTemplate = (state: StreamState, layoutId: string, cssTemplate: string): StreamState => _computeUsedVariables(_changeStreamLayout(state, layoutId, { cssTemplate }), layoutId)

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

const reduceSetStreamData = (state: StreamState, data: StreamPreRenderData): StreamState => ({
    ...state,
    out: {
        ...state.out,
        data
    }
})

const reduceAddStreamLayout = (state: StreamState, layoutId: string, name: string): StreamState => _computeUsedVariables({
    ...state,
    in: {
        ...state.in,
        layouts: {
            ...state.in.layouts,
            [layoutId]: {
                name,
                lastModified: Date.now(),
                author: state.in.defaultAuthor,
                backgroundType: defaultLayout.backgroundType,
                htmlTemplate: defaultLayout.htmlTemplate,
                cssTemplate: defaultLayout.cssTemplate,
            }
        }
    }
}, layoutId);

const reduceImportStreamLayoutFromFile = (state: StreamState, layoutId: string, layout: StreamExportLayout): StreamState => {
    return {
        ...state,
        in: {
            ...state.in,
            layouts: {
                ...state.in.layouts,
                [layoutId]: exportToSavedLayout(layout)
            }
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
            view: state.in.view.filter(w => w !== layoutId),
            trashLayouts: {
                ...state.in.trashLayouts,
                [layoutId]: {
                    ...state.in.layouts[layoutId],
                    stared: false
                }
            }
        }
    }
}

const reduceRestoreStreamLayout = (state: StreamState, layoutId: string): StreamState => ({
    ...state,
    in: {
        ...state.in,
        layouts: {
            ...state.in.layouts,
            [layoutId]: state.in.trashLayouts[layoutId]
        },
        trashLayouts: Object.fromEntries(Object.entries(state.in.trashLayouts).filter(([k, v]) => k !== layoutId))
    }
})

const reduceEmptyTrashLayouts = (state: StreamState): StreamState => ({
    ...state,
    in: {
        ...state.in,
        trashLayouts: {}
    }
})

const reduceAddStreamUserImage = (state: StreamState, layoutId: string): StreamState => {
    const vars = state.in.layouts[layoutId].images ?? []
    const nextId = vars?.length ? Math.max(...vars.map(v => v.id)) + 1 : 1
    return _changeStreamLayout(state, layoutId, {
        images: [ ...vars, {
            id: nextId,
            name: '',
            value: '',
            description: ''
        } ]
    })
}

const reduceRemoveStreamUserImage = (state: StreamState, layoutId: string, id: number): StreamState => _changeStreamLayout(state, layoutId, {
    images: state.in.layouts[layoutId].images?.filter(v => v.id !== id)
})

const reduceSetStreamUserImagePartial = (state: StreamState, layoutId: string, id: number, partial: Partial<StreamUserImageVariable>): StreamState => _changeStreamLayout(state, layoutId, {
    images: state.in.layouts[layoutId].images?.map(v => v.id === id ? { ...v, ...partial } : v)
})

const reduceSetStreamUsedLayouts = (state: StreamState, usedLayouts: string[]): StreamState => ({
    ...state,
    client: {
        ...state.client,
        usedLayouts
    }
})

export {
    initialState,
    initialStateIn,
    reduceSetStreamState,
    reduceSetStreamEnabled,
    reduceSetStreamAdvanced,
    reduceSetStreamBackgroundSelected,
    reduceSetStreamVariables,
    reduceSetStreamTemporalVariables,
    reduceSetStreamFormulaJavaScript,
    reduceSetStreamShowingLayoutId,
    reduceSetStreamHtmlTemplate,
    reduceSetStreamCssTemplate,
    reduceSetStreamStared,
    reduceSetStreamData,
    reduceSetStreamName,
    reduceSetStreamAuthor,
    reduceAddStreamLayout,
    reduceImportStreamLayoutFromFile,
    reduceAddStreamUserImage,
    reduceRemoveStreamLayout,
    reduceSetStreamUserImagePartial,
    reduceRestoreStreamLayout,
    reduceEmptyTrashLayouts,
    reduceRemoveStreamUserImage,
    reduceCloneStreamLayout,
    reduceClearStreamLayoutAlias,
    reduceSetStreamUsedLayouts
}
