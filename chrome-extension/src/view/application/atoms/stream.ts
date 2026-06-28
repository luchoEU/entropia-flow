import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { StreamStateIn, StreamStateOut } from '../state/stream'
import messages from '../../services/api/messages'
import { StreamRenderData, StreamSavedLayoutSet, StreamStateVariablesSet, StreamExportLayout, StreamSavedLayout, StreamUserImageVariable, StreamUserParameterVariable } from '../../../stream/data'
import { BackgroundType } from '../../../stream/background'
import { exportToSavedLayout } from '../../../stream/data.convert'
import { STORAGE_VIEW_STREAM } from '../../../common/const'
import { LOCAL_STORAGE } from '../../../chrome/chromeStorageArea'
import defaultLayout from '../helpers/layout/default.entropiaflow.layout.json'
import huntLayout from '../helpers/layout/hunt.entropiaflow.layout.json'
import lootLayout from '../helpers/layout/loot.entropiaflow.layout.json'

// Helper function to load builtin layouts
function loadBuiltinLayout(layout: StreamExportLayout, stared: boolean = false): StreamSavedLayout {
    return {
        ...exportToSavedLayout(layout),
        readonly: true,
        stared,
    }
}

// Initial state
const initialStateIn: StreamStateIn = {
    advanced: false,
    defaultAuthor: undefined!,
    view: [ 'entropiaflow.default' ],
    layouts: {
        ['entropiaflow.default']: loadBuiltinLayout(defaultLayout),
        ['entropiaflow.hunt']: loadBuiltinLayout(huntLayout),
        ['entropiaflow.loot']: loadBuiltinLayout(lootLayout),
    },
    trashLayouts: {},
}

const emptyRenderData: StreamRenderData = {
    layoutData: {},
    commonData: {},
    layouts: {},
}

// UI state type
interface StreamUiState {
  showingLayoutId?: string
}

// Cached storage data - initialized to initial state
let cachedStreamData = initialStateIn

// Persisted base atoms
export const streamInAtom = atomWithStorage<StreamStateIn>(
  STORAGE_VIEW_STREAM,
  initialStateIn,
  {
    getItem: (_key: string): StreamStateIn => cachedStreamData,
    setItem: async (_key: string, value: StreamStateIn): Promise<void> => {
      try {
        cachedStreamData = value
        await LOCAL_STORAGE.set(STORAGE_VIEW_STREAM, value)
      } catch (error) {
        console.error('Failed to save stream state to storage:', error)
      }
    },
    removeItem: (_key: string): void => {
      // Not used
    }
  }
)
export const streamVariablesAtom = atomWithStorage<StreamStateVariablesSet>('jotai-v1-stream-variables', { single: {}, temporal: {} })
export const streamUiAtom = atomWithStorage<StreamUiState>('jotai-v1-stream-ui', {})

// Atom to store the render data from background
export const streamRenderDataAtom = atom<StreamRenderData>(emptyRenderData)

/**
 * Initialize stream state from Chrome storage
 * Called on app startup to load persisted data
 */
export async function initializeStreamFromStorage(): Promise<void> {
  try {
    const storedState = await LOCAL_STORAGE.get(STORAGE_VIEW_STREAM)
    if (storedState) {
      // Re-apply current builtin layout definitions so changes to bundled JSONs
      // (e.g. new description/roles fields) take effect without clearing storage.
      // User data (stared flag) is preserved.
      const layouts = { ...storedState.layouts }
      for (const [id, builtin] of Object.entries(initialStateIn.layouts)) {
        if (layouts[id]) {
          layouts[id] = { ...builtin, stared: layouts[id].stared, state: layouts[id].state ?? builtin.state }
        }
      }
      cachedStreamData = { ...storedState, layouts }
    }
  } catch (error) {
    console.error('Failed to initialize stream state from storage:', error)
  }
}

/**
 * Initialize stream atom - loads from storage
 * Call once on app startup via: await store.set(initializeStreamAtom)
 */
export const initializeStreamAtom = atom(
  null,
  async (get, set) => {
    await initializeStreamFromStorage()
    set(streamInAtom, cachedStreamData)
    const ui = get(streamUiAtom)
    if (ui.showingLayoutId) {
        messages.setShowingLayoutId(ui.showingLayoutId)
    }
  }
)

// Helper functions
const _nextId = (layout: StreamSavedLayout): number =>
    Math.max(...(layout.images?.map(v => v.id) ?? []), ...(layout.parameters?.map(v => v.id) ?? []), 0) + 1

const _changeLayoutInState = (stateIn: StreamStateIn, layoutId: string, partial: Partial<StreamSavedLayout>): StreamStateIn => ({
    ...stateIn,
    layouts: {
        ...stateIn.layouts,
        [layoutId]: {
            ...stateIn.layouts[layoutId],
            ...partial,
            lastModified: Date.now()
        }
    }
})

// Write atoms - State management
export const setStreamStateAtom = atom(
  null,
  (_get, set, newStateIn: StreamStateIn) => {
    const layouts = {
        ...Object.fromEntries(Object.entries(newStateIn.layouts).map(([k, v]) => [k, { ...v, readonly: false }])),
        ...Object.fromEntries(Object.entries(initialStateIn.layouts).map(([k, v]) => [k, { ...v, backgroundType: newStateIn.layouts[k].backgroundType ?? v.backgroundType, stared: newStateIn.layouts[k].stared ?? v.stared }])),
    }
    set(streamInAtom, { ...newStateIn, layouts })
    set(streamVariablesAtom, { single: {}, temporal: {} })
    set(streamUiAtom, {})
  }
)

// Write atoms - Advanced mode
export const setStreamAdvancedAtom = atom(
  null,
  (get, set, advanced: boolean) => {
    const stateIn = get(streamInAtom)
    set(streamInAtom, {
        ...stateIn,
        advanced
    })
  }
)

export const setStreamAuthorAtom = atom(
  null,
  (get, set, layoutId: string, author: string) => {
    const stateIn = get(streamInAtom)
    set(streamInAtom, {
        ...stateIn,
        defaultAuthor: author,
        layouts: {
            ...stateIn.layouts,
            [layoutId]: {
                ...stateIn.layouts[layoutId],
                author,
                lastModified: Date.now()
            }
        }
    })
  }
)

export const setStreamBackgroundSelectedAtom = atom(
  null,
  (get, set, layoutId: string, backgroundType: BackgroundType) => {
    const stateIn = get(streamInAtom)
    set(streamInAtom, _changeLayoutInState(stateIn, layoutId, { backgroundType }))
  }
)

// Write atoms - Variables
export const setStreamVariablesAtom = atom(
  null,
  (_get, set, variables: StreamStateVariablesSet) => {
    set(streamVariablesAtom, variables)
  }
)

// Write atoms - Layouts
export const addStreamLayoutAtom = atom(
  null,
  (get, set, layoutId: string, name: string) => {
    const stateIn = get(streamInAtom)
    set(streamInAtom, {
        ...stateIn,
        layouts: {
            ...stateIn.layouts,
            [layoutId]: {
                name,
                lastModified: Date.now(),
                author: stateIn.defaultAuthor,
                backgroundType: defaultLayout.backgroundType,
                htmlTemplate: defaultLayout.htmlTemplate,
                cssTemplate: defaultLayout.cssTemplate,
            }
        }
    })
  }
)

export const removeStreamLayoutAtom = atom(
  null,
  (get, set, layoutId: string) => {
    const stateIn = get(streamInAtom)
    if (stateIn.layouts[layoutId]?.readonly) {
        return
    }
    set(streamInAtom, {
        ...stateIn,
        layouts: Object.fromEntries(Object.entries(stateIn.layouts).filter(([k]) => k !== layoutId)),
        view: stateIn.view.filter(w => w !== layoutId),
        trashLayouts: {
            ...stateIn.trashLayouts,
            [layoutId]: {
                ...stateIn.layouts[layoutId],
                stared: false
            }
        }
    })
  }
)

export const cloneStreamLayoutAtom = atom(
  null,
  (get, set, layoutId: string, newLayoutId: string, newName: string) => {
    const stateIn = get(streamInAtom)
    const layout = stateIn.layouts[layoutId]
    if (!layout) {
        return
    }
    set(streamInAtom, {
        ...stateIn,
        layouts: {
            ...stateIn.layouts,
            [newLayoutId]: {
                ...layout,
                name: newName,
                lastModified: Date.now(),
                author: stateIn.defaultAuthor,
                readonly: false,
                stared: false
            }
        }
    })
  }
)

export const restoreStreamLayoutAtom = atom(
  null,
  (get, set, layoutId: string) => {
    const stateIn = get(streamInAtom)
    set(streamInAtom, {
        ...stateIn,
        layouts: {
            ...stateIn.layouts,
            [layoutId]: stateIn.trashLayouts[layoutId]
        },
        trashLayouts: Object.fromEntries(Object.entries(stateIn.trashLayouts).filter(([k]) => k !== layoutId))
    })
  }
)

export const importStreamLayoutFromFileAtom = atom(
  null,
  (get, set, layoutId: string, layout: StreamExportLayout) => {
    const stateIn = get(streamInAtom)
    set(streamInAtom, {
        ...stateIn,
        layouts: {
            ...stateIn.layouts,
            [layoutId]: exportToSavedLayout(layout)
        }
    })
  }
)

export const emptyTrashLayoutsAtom = atom(
  null,
  (get, set) => {
    const stateIn = get(streamInAtom)
    set(streamInAtom, {
        ...stateIn,
        trashLayouts: {}
    })
  }
)

// Write atoms - Editor
export const setStreamHtmlTemplateAtom = atom(
  null,
  (get, set, layoutId: string, htmlTemplate: string) => {
    const stateIn = get(streamInAtom)
    set(streamInAtom, _changeLayoutInState(stateIn, layoutId, { htmlTemplate }))
  }
)

export const setStreamCssTemplateAtom = atom(
  null,
  (get, set, layoutId: string, cssTemplate: string) => {
    const stateIn = get(streamInAtom)
    set(streamInAtom, _changeLayoutInState(stateIn, layoutId, { cssTemplate }))
  }
)

export const setStreamFormulaJavaScriptAtom = atom(
  null,
  (get, set, layoutId: string, code: string) => {
    const stateIn = get(streamInAtom)
    set(streamInAtom, _changeLayoutInState(stateIn, layoutId, { formulaJavaScript: code }))
  }
)

export const setStreamDescriptionAtom = atom(
  null,
  (get, set, layoutId: string, description: string) => {
    const stateIn = get(streamInAtom)
    set(streamInAtom, _changeLayoutInState(stateIn, layoutId, { description: description || undefined }))
  }
)

export const setStreamRolesAtom = atom(
  null,
  (get, set, layoutId: string, roles: string[]) => {
    const stateIn = get(streamInAtom)
    set(streamInAtom, _changeLayoutInState(stateIn, layoutId, { roles: roles.length ? roles : undefined }))
  }
)

// Write atoms - Metadata
export const setStreamNameAtom = atom(
  null,
  (get, set, layoutId: string, newLayoutId: string, name: string) => {
    const stateIn = get(streamInAtom)
    const layouts = { ...stateIn.layouts }
    if (layoutId !== newLayoutId) {
        delete layouts[layoutId]
    }
    layouts[newLayoutId] = { ...stateIn.layouts[layoutId], name, lastModified: Date.now() }
    set(streamInAtom, {
        ...stateIn,
        layouts,
        layoutAlias: { urlLayoutId: stateIn.layoutAlias?.urlLayoutId ?? layoutId, realLayoutId: newLayoutId }
    })
  }
)

export const setStreamStaredAtom = atom(
  null,
  (get, set, layoutId: string, stared: boolean) => {
    const stateIn = get(streamInAtom)
    set(streamInAtom, {
        ...stateIn,
        layouts: Object.fromEntries(Object.entries(stateIn.layouts).map(([id, layout]) => [id, id === layoutId ? { ...layout, stared } : layout])),
        view: stared ? [...stateIn.view, layoutId] : stateIn.view.filter(w => w !== layoutId)
    })
  }
)

// Write atoms - UI
export const setStreamShowingLayoutIdAtom = atom(
  null,
  (get, set, layoutId: string) => {
    const ui = get(streamUiAtom)
    set(streamUiAtom, {
        ...ui,
        showingLayoutId: layoutId
    })
    messages.setShowingLayoutId(layoutId)
  }
)

export const setStreamDataAtom = atom(
  null,
  (_get, set, data: StreamRenderData) => {
    set(streamRenderDataAtom, data)
  }
)

export const clearStreamLayoutAliasAtom = atom(
  null,
  (get, set) => {
    const stateIn = get(streamInAtom)
    set(streamInAtom, {
        ...stateIn,
        layoutAlias: undefined
    })
  }
)

// Write atoms - User content
export const addStreamUserImageAtom = atom(
  null,
  (get, set, layoutId: string) => {
    const stateIn = get(streamInAtom)
    const layout = stateIn.layouts[layoutId]
    if (!layout) {
        return
    }
    set(streamInAtom, _changeLayoutInState(stateIn, layoutId, {
        images: [ ...layout.images ?? [], {
            id: _nextId(layout),
            name: '',
            value: '',
            description: ''
        } ]
    }))
  }
)

export const addStreamUserParameterAtom = atom(
  null,
  (get, set, layoutId: string) => {
    const stateIn = get(streamInAtom)
    const layout = stateIn.layouts[layoutId]
    if (!layout) {
        return
    }
    set(streamInAtom, _changeLayoutInState(stateIn, layoutId, {
        parameters: [ ...layout.parameters ?? [], {
            id: _nextId(layout),
            name: '',
            value: '',
            description: ''
        } ]
    }))
  }
)

export const removeStreamUserAtom = atom(
  null,
  (get, set, layoutId: string, id: number) => {
    const stateIn = get(streamInAtom)
    set(streamInAtom, _changeLayoutInState(stateIn, layoutId, {
        images: stateIn.layouts[layoutId].images?.filter(v => v.id !== id),
        parameters: stateIn.layouts[layoutId].parameters?.filter(v => v.id !== id)
    }))
  }
)

export const setStreamUserPartialAtom = atom(
  null,
  (get, set, layoutId: string, id: number, partial: Partial<StreamUserImageVariable>) => {
    const stateIn = get(streamInAtom)
    set(streamInAtom, _changeLayoutInState(stateIn, layoutId, {
        images: stateIn.layouts[layoutId].images?.map(v => v.id === id ? { ...v, ...partial } : v),
        parameters: stateIn.layouts[layoutId].parameters?.map(v => v.id === id ? { ...v, ...partial } : v)
    }))
  }
)

export const setStreamUserParametersAtom = atom(
  null,
  (get, set, layoutId: string, parameters: StreamUserParameterVariable[]) => {
    const stateIn = get(streamInAtom)
    set(streamInAtom, _changeLayoutInState(stateIn, layoutId, { parameters }))
  }
)

export const setStreamUserImagesAtom = atom(
  null,
  (get, set, layoutId: string, images: StreamUserImageVariable[]) => {
    const stateIn = get(streamInAtom)
    set(streamInAtom, _changeLayoutInState(stateIn, layoutId, { images }))
  }
)

// Stub for navigating to trash layouts
export const goToTrashAtom = atom(
  null,
  (get, set) => {
    console.log('TODO: Navigate to trash layouts');
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// Undo / Redo history for agent-applied changes
// ─────────────────────────────────────────────────────────────────────────────

export interface StreamLayoutSnapshot {
  formulaJavaScript?: string
  htmlTemplate?: string
  cssTemplate?: string
  images?: StreamUserImageVariable[]
  parameters?: StreamUserImageVariable[]
}

interface StreamLayoutHistoryState {
  /** past[0] is the oldest snapshot, past[last] is right before the current state */
  past: StreamLayoutSnapshot[]
  /** future[0] is the next redo state */
  future: StreamLayoutSnapshot[]
}

type StreamHistoryMap = Record<string, StreamLayoutHistoryState>

/** In-memory only — not persisted */
export const streamLayoutHistoryAtom = atom<StreamHistoryMap>({})

/** Push a snapshot of the layout before a change. Called by the agent chat before applying. */
export const pushStreamHistoryAtom = atom(
  null,
  (get, set, layoutId: string, snapshot: StreamLayoutSnapshot) => {
    const historyMap = get(streamLayoutHistoryAtom)
    const entry = historyMap[layoutId] ?? { past: [], future: [] }
    set(streamLayoutHistoryAtom, {
      ...historyMap,
      [layoutId]: {
        past: [...entry.past.slice(-49), snapshot], // keep max 50
        future: [],
      }
    })
  }
)

/** Undo the last agent change for a layoutId */
export const undoStreamLayoutAtom = atom(
  null,
  (get, set, layoutId: string) => {
    const historyMap = get(streamLayoutHistoryAtom)
    const entry = historyMap[layoutId]
    if (!entry || entry.past.length === 0) return

    const stateIn = get(streamInAtom)
    const layout = stateIn.layouts[layoutId]
    if (!layout) return

    const currentSnapshot: StreamLayoutSnapshot = {
      formulaJavaScript: layout.formulaJavaScript,
      htmlTemplate: layout.htmlTemplate,
      cssTemplate: layout.cssTemplate,
      images: layout.images ? [...layout.images] : undefined,
      parameters: layout.parameters ? [...layout.parameters] : undefined,
    }

    const previousSnapshot = entry.past[entry.past.length - 1]

    // Restore previous snapshot into layout
    set(streamInAtom, _changeLayoutInState(stateIn, layoutId, {
      formulaJavaScript: previousSnapshot.formulaJavaScript,
      htmlTemplate: previousSnapshot.htmlTemplate,
      cssTemplate: previousSnapshot.cssTemplate,
      images: previousSnapshot.images ? [...previousSnapshot.images] : undefined,
      parameters: previousSnapshot.parameters ? [...previousSnapshot.parameters] : undefined,
    }))

    // Update history stacks
    set(streamLayoutHistoryAtom, {
      ...historyMap,
      [layoutId]: {
        past: entry.past.slice(0, -1),
        future: [currentSnapshot, ...entry.future],
      }
    })
  }
)

/** Redo the last undone change for a layoutId */
export const redoStreamLayoutAtom = atom(
  null,
  (get, set, layoutId: string) => {
    const historyMap = get(streamLayoutHistoryAtom)
    const entry = historyMap[layoutId]
    if (!entry || entry.future.length === 0) return

    const stateIn = get(streamInAtom)
    const layout = stateIn.layouts[layoutId]
    if (!layout) return

    const currentSnapshot: StreamLayoutSnapshot = {
      formulaJavaScript: layout.formulaJavaScript,
      htmlTemplate: layout.htmlTemplate,
      cssTemplate: layout.cssTemplate,
      images: layout.images ? [...layout.images] : undefined,
      parameters: layout.parameters ? [...layout.parameters] : undefined,
    }

    const nextSnapshot = entry.future[0]

    // Restore next snapshot into layout
    set(streamInAtom, _changeLayoutInState(stateIn, layoutId, {
      formulaJavaScript: nextSnapshot.formulaJavaScript,
      htmlTemplate: nextSnapshot.htmlTemplate,
      cssTemplate: nextSnapshot.cssTemplate,
      images: nextSnapshot.images ? [...nextSnapshot.images] : undefined,
      parameters: nextSnapshot.parameters ? [...nextSnapshot.parameters] : undefined,
    }))

    // Update history stacks
    set(streamLayoutHistoryAtom, {
      ...historyMap,
      [layoutId]: {
        past: [...entry.past, currentSnapshot],
        future: entry.future.slice(1),
      }
    })
  }
)
