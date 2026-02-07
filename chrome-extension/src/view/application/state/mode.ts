interface ModeState {
    showSubtitles: boolean
    showVisibleToggle: boolean
    menuPinned: boolean
    streamViewPinned: boolean
}

const initialState: ModeState = {
    showSubtitles: true,
    showVisibleToggle: false,
    menuPinned: true,
    streamViewPinned: false
}

export default ModeState
export { initialState }
