import { BackgroundType } from '../../../stream/background'
import StreamRenderData, { StreamRenderDefinition } from '../../../stream/data';
import { StreamState, StreamStateIn, StreamVariable } from "../state/stream";

const _defaultDefinition: StreamRenderDefinition = {
    backgroundType: BackgroundType.Light,
    size: { width: 494, height: 150 },
    template: `
      <div style='font-size: 14px; position: absolute; top: 50px; left: 50px;'>
        <img style='width: 50px' src='{logoUrl}' alt='Logo'></img>
        <div style='font-size: 20px; font-weight: bold; position: absolute; top: 0px; left: 60px; width: 200px;'>
          Entropia Flow
        </div>
        <div style='position: absolute; top: 26px; left: 69px; width: 200px;'>
          Chrome Extension
        </div>
        <div style='position: absolute; top: 0px; left: 208px; width: 170px; background-color: {deltaBackColor}; color: white; padding: 8px; border-radius: 8px; text-align: center;'>
          {delta} PED {deltaWord}
        </div>
        <div style='position: absolute; top: 36px; left: 208px; width: 170px; font-size: 12px; text-align: center;'>
          {message}
        </div>
      </div>`
}

const initialStateIn: StreamStateIn = {
    enabled: false,
    expanded: {
        background: true,
    },
    definition: _defaultDefinition
}

const initialState: StreamState = {
    in: initialStateIn,
    variables: { },
    out: undefined
}

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

const reduceSetStreamBackgroundExpanded = (state: StreamState, expanded: boolean): StreamState => ({
    ...state,
    in: {
        ...state.in,
        expanded: {
            ...state.in.expanded,
            background: expanded
        }
    }
})

const reduceSetStreamBackgroundSelected = (state: StreamState, selected: BackgroundType): StreamState => ({
    ...state,
    in: {
        ...state.in,
        definition: {
            ...state.in.definition,
            backgroundType: selected
        }
    }
})

const reduceSetStreamVariables = (state: StreamState, source: string, variables: StreamVariable[]): StreamState => ({
    ...state,
    variables: {
        ...state.variables,
        [source]: variables
    }
})

const reduceSetStreamTemplate = (state: StreamState, template: string): StreamState => ({
    ...state,
    in: {
        ...state.in,
        definition: {
            ...state.in.definition,
            template
        }
    }
})

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
    reduceSetStreamState,
    reduceSetStreamEnabled,
    reduceSetStreamBackgroundExpanded,
    reduceSetStreamBackgroundSelected,
    reduceSetStreamVariables,
    reduceSetStreamTemplate,
    reduceSetStreamData
}
