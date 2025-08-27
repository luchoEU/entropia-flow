import { StreamComputedLayoutDataSet, StreamSavedLayoutSet, StreamStateVariable, StreamTemporalVariable } from "../../stream/data"
import { ItemsState } from "../../view/application/state/items"
import { LastRequiredState } from "../../view/application/state/last"

interface StreamBuilderState {
    layouts?: StreamSavedLayoutSet
    computed?: StreamComputedLayoutDataSet
    usedLayouts?: string[]
    showingLayoutId?: string
    last?: LastRequiredState
    items?: ItemsState
}

interface StreamVariablesBuilder {
    onChanged?: () => Promise<void>
    getName(): string
    getVariables(state: StreamBuilderState): Promise<StreamStateVariable[]>
}

interface StreamTemporalVariablesBuilder {
    onTemporalChanged?: () => Promise<void>
    getTemporalName(): string
    getTemporalVariables(state: StreamBuilderState): Promise<StreamTemporalVariable[]>
}

export {
    StreamBuilderState,
    StreamVariablesBuilder,
    StreamTemporalVariablesBuilder
}
