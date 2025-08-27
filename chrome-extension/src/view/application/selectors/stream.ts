import { StreamRenderData, StreamSavedLayout, StreamSavedLayoutSet } from "../../../stream/data"
import { StreamState, StreamStateIn, StreamStateOut } from "../state/stream"

export const getStream = (state: any): StreamState => state.stream
export const getStreamIn = (state: any): StreamStateIn => getStream(state).in
export const getStreamOut = (state: any): StreamStateOut => getStream(state).out
export const getStreamData = (state: any): StreamRenderData | undefined => getStreamOut(state).data
export const getStreamAdvancedEditor = (state: any): boolean => getStreamIn(state).advanced
export const getStreamShowingLayoutId = (state: any): string | undefined => getStream(state).ui.showingLayoutId

export const getStreamLayouts = (state: any): StreamSavedLayoutSet => getStreamIn(state).layouts
export const getStreamTrashLayouts = (state: any): StreamSavedLayoutSet => getStreamIn(state).trashLayouts
export const getStreamLayout = (layoutId: string) => (state: any): { layout: StreamSavedLayout | undefined, id: string, shouldClearAlias } => {
    const inState = getStreamIn(state);
    const realLayoutId = inState.layoutAlias?.urlLayoutId === layoutId ? inState.layoutAlias.realLayoutId : layoutId;
    return { layout: inState.layouts[realLayoutId], id: realLayoutId, shouldClearAlias: inState.layoutAlias !== undefined && realLayoutId === layoutId };
}
