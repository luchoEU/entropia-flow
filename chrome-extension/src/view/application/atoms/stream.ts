import { atom } from 'jotai'
import { StreamState, StreamStateIn } from '../state/stream'
import { StreamRenderData, StreamSavedLayoutSet, StreamStateVariablesSet, StreamExportLayout } from '../../../stream/data'
import { BackgroundType } from '../../../stream/background'
import {
  initialState,
  reduceSetStreamState,
  reduceSetStreamEnabled,
  reduceSetStreamAdvanced,
  reduceSetStreamBackgroundSelected,
  reduceSetStreamVariables,
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
  reduceAddStreamUserParameter,
  reduceRemoveStreamLayout,
  reduceSetStreamUserPartial,
  reduceRestoreStreamLayout,
  reduceEmptyTrashLayouts,
  reduceRemoveStreamUser,
  reduceCloneStreamLayout,
  reduceClearStreamLayoutAlias
} from '../helpers/stream'

// Base atoms
export const streamInAtom = atom(initialState.in)
export const streamVariablesAtom = atom(initialState.variables)
export const streamUiAtom = atom(initialState.ui)
export const streamOutAtom = atom(initialState.out)

// Computed state atom
export const streamStateAtom = atom((get) => ({
  in: get(streamInAtom),
  variables: get(streamVariablesAtom),
  ui: get(streamUiAtom),
  out: get(streamOutAtom)
} as StreamState))

// Write atoms - State management
export const setStreamStateAtom = atom(
  null,
  (get, set, newState: StreamStateIn) => {
    const state = get(streamStateAtom)
    const updated = reduceSetStreamState(state, newState)
    set(streamInAtom, updated.in)
    set(streamVariablesAtom, updated.variables)
    set(streamUiAtom, updated.ui)
    set(streamOutAtom, updated.out)
  }
)

export const setStreamEnabledAtom = atom(
  null,
  (get, set, enabled: boolean) => {
    const state = get(streamStateAtom)
    const updated = reduceSetStreamEnabled(state, enabled)
    set(streamInAtom, updated.in)
  }
)

// Write atoms - Advanced mode
export const setStreamAdvancedAtom = atom(
  null,
  (get, set, advanced: boolean) => {
    const state = get(streamStateAtom)
    const updated = reduceSetStreamAdvanced(state, advanced)
    set(streamInAtom, updated.in)
  }
)

// Write atoms - Variables
export const setStreamVariablesAtom = atom(
  null,
  (get, set, variables: StreamStateVariablesSet) => {
    const state = get(streamStateAtom)
    const updated = reduceSetStreamVariables(state, variables)
    set(streamVariablesAtom, updated.variables)
  }
)

// Write atoms - Layouts
export const addStreamLayoutAtom = atom(
  null,
  (get, set, layoutId: string, name: string) => {
    const state = get(streamStateAtom)
    const updated = reduceAddStreamLayout(state, layoutId, name)
    set(streamInAtom, updated.in)
  }
)

export const removeStreamLayoutAtom = atom(
  null,
  (get, set, layoutId: string) => {
    const state = get(streamStateAtom)
    const updated = reduceRemoveStreamLayout(state, layoutId)
    set(streamInAtom, updated.in)
  }
)

export const cloneStreamLayoutAtom = atom(
  null,
  (get, set, layoutId: string, newLayoutId: string, newName: string) => {
    const state = get(streamStateAtom)
    const updated = reduceCloneStreamLayout(state, layoutId, newLayoutId, newName)
    set(streamInAtom, updated.in)
  }
)

export const restoreStreamLayoutAtom = atom(
  null,
  (get, set, layoutId: string) => {
    const state = get(streamStateAtom)
    const updated = reduceRestoreStreamLayout(state, layoutId)
    set(streamInAtom, updated.in)
  }
)

export const importStreamLayoutFromFileAtom = atom(
  null,
  (get, set, layoutId: string, layout: StreamExportLayout) => {
    const state = get(streamStateAtom)
    const updated = reduceImportStreamLayoutFromFile(state, layoutId, layout)
    set(streamInAtom, updated.in)
  }
)

export const emptyTrashLayoutsAtom = atom(
  null,
  (get, set) => {
    const state = get(streamStateAtom)
    const updated = reduceEmptyTrashLayouts(state)
    set(streamInAtom, updated.in)
  }
)

// Write atoms - Editor
export const setStreamHtmlTemplateAtom = atom(
  null,
  (get, set, layoutId: string, htmlTemplate: string) => {
    const state = get(streamStateAtom)
    const updated = reduceSetStreamHtmlTemplate(state, layoutId, htmlTemplate)
    set(streamInAtom, updated.in)
  }
)

export const setStreamCssTemplateAtom = atom(
  null,
  (get, set, layoutId: string, cssTemplate: string) => {
    const state = get(streamStateAtom)
    const updated = reduceSetStreamCssTemplate(state, layoutId, cssTemplate)
    set(streamInAtom, updated.in)
  }
)

export const setStreamFormulaJavaScriptAtom = atom(
  null,
  (get, set, layoutId: string, code: string) => {
    const state = get(streamStateAtom)
    const updated = reduceSetStreamFormulaJavaScript(state, layoutId, code)
    set(streamInAtom, updated.in)
  }
)

// Write atoms - Metadata
export const setStreamNameAtom = atom(
  null,
  (get, set, layoutId: string, newLayoutId: string, name: string) => {
    const state = get(streamStateAtom)
    const updated = reduceSetStreamName(state, layoutId, newLayoutId, name)
    set(streamInAtom, updated.in)
  }
)

export const setStreamAuthorAtom = atom(
  null,
  (get, set, layoutId: string, author: string) => {
    const state = get(streamStateAtom)
    const updated = reduceSetStreamAuthor(state, layoutId, author)
    set(streamInAtom, updated.in)
  }
)

export const setStreamBackgroundSelectedAtom = atom(
  null,
  (get, set, layoutId: string, backgroundType: BackgroundType) => {
    const state = get(streamStateAtom)
    const updated = reduceSetStreamBackgroundSelected(state, layoutId, backgroundType)
    set(streamInAtom, updated.in)
  }
)

export const setStreamStaredAtom = atom(
  null,
  (get, set, layoutId: string, stared: boolean) => {
    const state = get(streamStateAtom)
    const updated = reduceSetStreamStared(state, layoutId, stared)
    set(streamInAtom, updated.in)
  }
)

// Write atoms - UI
export const setStreamShowingLayoutIdAtom = atom(
  null,
  (get, set, layoutId: string) => {
    const state = get(streamStateAtom)
    const updated = reduceSetStreamShowingLayoutId(state, layoutId)
    set(streamUiAtom, updated.ui)
  }
)

export const setStreamDataAtom = atom(
  null,
  (get, set, data: StreamRenderData) => {
    const state = get(streamStateAtom)
    const updated = reduceSetStreamData(state, data)
    set(streamOutAtom, updated.out)
  }
)

export const clearStreamLayoutAliasAtom = atom(
  null,
  (get, set) => {
    const state = get(streamStateAtom)
    const updated = reduceClearStreamLayoutAlias(state)
    set(streamInAtom, updated.in)
  }
)

// Write atoms - User content
export const addStreamUserImageAtom = atom(
  null,
  (get, set, layoutId: string) => {
    const state = get(streamStateAtom)
    const updated = reduceAddStreamUserImage(state, layoutId)
    set(streamInAtom, updated.in)
  }
)

export const addStreamUserParameterAtom = atom(
  null,
  (get, set, layoutId: string) => {
    const state = get(streamStateAtom)
    const updated = reduceAddStreamUserParameter(state, layoutId)
    set(streamInAtom, updated.in)
  }
)

export const removeStreamUserAtom = atom(
  null,
  (get, set, layoutId: string, id: number) => {
    const state = get(streamStateAtom)
    const updated = reduceRemoveStreamUser(state, layoutId, id)
    set(streamInAtom, updated.in)
  }
)

export const setStreamUserPartialAtom = atom(
  null,
  (get, set, layoutId: string, id: number, partial: any) => {
    const state = get(streamStateAtom)
    const updated = reduceSetStreamUserPartial(state, layoutId, id, partial)
    set(streamInAtom, updated.in)
  }
)

// Stub for navigating to trash layouts
export const goToTrashAtom = atom(
  null,
  (get, set) => {
    console.log('TODO: Navigate to trash layouts');
  }
)
