import { StreamRenderLayout, StreamRenderLayoutSet, StreamRenderObject } from "../../../stream/data"
import { StreamState, StreamStateIn, StreamStateOut } from "../state/stream"

export const getStream = (state: any): StreamState => state.stream
export const getStreamIn = (state: any): StreamStateIn => getStream(state).in
export const getStreamOut = (state: any): StreamStateOut => getStream(state).out
export const getStreamLayouts = (state: any): StreamRenderLayoutSet => getStreamIn(state).layouts
export const getStreamLayout = (layoutId: string) => (state: any): StreamRenderLayout | undefined => getStreamLayouts(state)[layoutId]
export const getStreamData = (state: any): StreamRenderObject | undefined => getStreamOut(state).data.data
export const getStreamAdvancedEditor = (state: any): boolean => getStreamIn(state).advanced
