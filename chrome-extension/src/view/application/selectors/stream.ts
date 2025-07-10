import { StreamRenderLayout, StreamRenderLayoutSet, StreamRenderObject } from "../../../stream/data"
import { StreamState, StreamStateIn, StreamStateOut, StreamUserVariable } from "../state/stream"

export const getStream = (state: any): StreamState => state.stream
export const getStreamIn = (state: any): StreamStateIn => getStream(state).in
export const getStreamOut = (state: any): StreamStateOut => getStream(state).out
export const getStreamData = (state: any): StreamRenderObject | undefined => getStreamOut(state).data.data
export const getStreamAdvancedEditor = (state: any): boolean => getStreamIn(state).advanced
export const getStreamUserVariables = (state: any): StreamUserVariable[] => getStreamIn(state).userVariables

export const getStreamLayouts = (state: any): StreamRenderLayoutSet => getStreamIn(state).layouts
export const getStreamTrashLayouts = (state: any): StreamRenderLayoutSet => getStreamIn(state).trashLayouts
export const getStreamLayout = (layoutId: string) => (state: any): { layout: StreamRenderLayout | undefined, id: string, shouldClearAlias } => {
    const inState = getStreamIn(state);
    const realLayoutId = inState.layoutAlias?.urlLayoutId === layoutId ? inState.layoutAlias.realLayoutId : layoutId;
    return { layout: inState.layouts[realLayoutId], id: realLayoutId, shouldClearAlias: inState.layoutAlias !== undefined && realLayoutId === layoutId };
}
