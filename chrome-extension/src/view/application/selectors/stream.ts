import { StreamRenderLayoutSet } from "../../../stream/data"
import { StreamState, StreamStateIn, StreamStateOut } from "../state/stream"

export const getStream = (state: any): StreamState => state.stream
export const getStreamIn = (state: any): StreamStateIn => getStream(state).in
export const getStreamOut = (state: any): StreamStateOut => getStream(state).out
export const getStreamLayouts = (state: any): StreamRenderLayoutSet => getStreamIn(state).layouts
export const getStreamEnabled = (state: any): boolean => getStreamIn(state).enabled
export const getStreamAdvancedEditor = (state: any): boolean => getStreamIn(state).advanced
