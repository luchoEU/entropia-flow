import { BackgroundType } from '../../../stream/background'
import StreamRenderData from '../../../stream/data';
import { HtmlTemplateData } from '../../../stream/htmlTemplate';
import { StreamState, StreamStateIn, StreamVariable } from "../state/stream";

const _defaultTemplate: HtmlTemplateData = {
    name: 'default',
    size: { width: 494, height: 150 },
    html: `
      <div style='margin: 50px; position: absolute'>
        <img style='width: 50px; position: absolute; top: 0px; left: 0px;' src='{logoUrl}' alt='Logo'></img>
        <div style='font-size: 20px; font-weight: bold; position: absolute; top: 0px; left: 60px; width: 200px;'>
          Entropia Flow
        </div>
        <div style='font-size: 14px; position: absolute; top: 26px; left: 69px; width: 200px;'>
          Chrome Extension
        </div>
        <div style='font-size: 14px; width: 170px; padding: 8px; border-radius: 8px; text-align: center; position: absolute; top: 0px; left: 208px; background-color: {deltaBackColor}; color: white;'>
          {deltaText} PED {deltaWord}
        </div>
        <div style='font-size: 12px; width: 170px; text-align: center; position: absolute; top: 36px; left: 208px;'>
          {message}
        </div>
      </div>`
}

const initialStateIn: StreamStateIn = {
    enabled: false,
    background: {
        expanded: true,
        selected: BackgroundType.Light,
    },
    template: _defaultTemplate
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
        background: {
            ...state.in.background,
            expanded
        }
    }
})

const reduceSetStreamBackgroundSelected = (state: StreamState, selected: BackgroundType): StreamState => ({
    ...state,
    in: {
        ...state.in,
        background: {
            ...state.in.background,
            selected
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

const reduceSetStreamTemplate = (state: StreamState, html: string): StreamState => ({
    ...state,
    in: {
        ...state.in,
        template: {
            ...state.in.template,
            html
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
