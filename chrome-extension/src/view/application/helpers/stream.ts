import { BackgroundType } from '../../../stream/background'
import StreamRenderData, { StreamRenderLayout } from '../../../stream/data';
import { StreamState, StreamStateIn, StreamVariable } from "../state/stream";

const DEFAULT_LAYOUT_NAME = 'Entropia Flow'

const _defaultDefinition: StreamRenderLayout = {
    name: DEFAULT_LAYOUT_NAME,
    backgroundType: BackgroundType.Ashfall,
    containerStyle: 'width: 494px; height: 150px;',
    template: `
<div style='display: flex; align-items: start; font-size: 14px; margin: 50px;'>
  <img style='width: 50px;' src='{logoUrl}' alt='Logo'></img>
  <div style='display: flex; flex-direction: column; margin: 0px 10px;'>
    <div style='font-size: 20px; font-weight: bold;'>Entropia Flow</div>
    <div style='margin-left: 10px'>Chrome Extension</div>
  </div>
  <div style='display: flex; flex-direction: column; margin-left: 5px; width: 180px;'>
    <div style='background-color: {deltaBackColor}; color: white; padding: 8px; border-radius: 8px; text-align: center;'>
      {delta} PED {deltaWord}
    </div>
    <div style='margin-top: 5px; font-size: 12px; text-align: center;'>{message}</div>
  </div>
</div>`
}

const initialStateIn: StreamStateIn = {
    enabled: false,
    windows: [ DEFAULT_LAYOUT_NAME ],
    layouts: {
        [DEFAULT_LAYOUT_NAME]: _defaultDefinition
    }
}

const initialState: StreamState = {
    in: initialStateIn,
    variables: { },
    out: undefined
}

const isLayoutReadonly = (name: string): boolean => name === DEFAULT_LAYOUT_NAME

const reduceSetStreamState = (state: StreamState, newState: StreamStateIn): StreamState => ({
    in: newState,
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
            [state.in.editing.layout]: {
                ...state.in.layouts[state.in.editing.layout],
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

const reduceSetStreamTemplate = (state: StreamState, template: string): StreamState => _changeStreamLayout(state, {
    template
})

const reduceSetStreamContainerStyle = (state: StreamState, style: string): StreamState => _changeStreamLayout(state, {
    containerStyle: style
})

const reduceSetStreamEditing = (state: StreamState, editing: string): StreamState => ({
    ...state,
    in: {
        ...state.in,
        editing: editing === undefined ? undefined : { layout: editing }
    }
})

const reduceSetStreamDefault = (state: StreamState, name: string): StreamState => ({
    ...state,
    in: {
        ...state.in,
        windows: [ name ]
    }
})

const reduceSetStreamName = (state: StreamState, name: string): StreamState => {
    const layouts = { ...state.in.layouts }
    delete layouts[state.in.editing.layout]
    let id = name
    let i = 1
    while (layouts[id]) {
        id = `${name}_${i}`
        i++
    }
    layouts[id] = { ...state.in.layouts[state.in.editing.layout], name }
    return {
        ...state,
        in: {
            ...state.in,
            editing: {
                layout: id
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

export {
    initialState,
    initialStateIn,
    isLayoutReadonly,
    reduceSetStreamState,
    reduceSetStreamEnabled,
    reduceSetStreamBackgroundSelected,
    reduceSetStreamVariables,
    reduceSetStreamTemplate,
    reduceSetStreamContainerStyle,
    reduceSetStreamEditing,
    reduceSetStreamDefault,
    reduceSetStreamData,
    reduceSetStreamName,
}
