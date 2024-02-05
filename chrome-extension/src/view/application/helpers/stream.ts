import { BackgroundType } from '../../../stream/background'
import { BackgroundSpec, StreamState } from "../state/stream";

const initialState: StreamState = {
    enabled: false,
    background: {
        expanded: true,
        selected: BackgroundType.Light,
    }
}

const isValid = (state: StreamState): boolean => state.background !== undefined

const setState = (state: StreamState, newState: StreamState): StreamState => {
    return isValid(newState) ? newState : initialState
}

const setEnabled = (state: StreamState, enabled: boolean) => ({
    ...state,
    enabled
})

const setBackgroundExpanded = (state: StreamState, expanded: boolean): StreamState => ({
    ...state,
    background: {
        ...state.background,
        expanded
    }
})

const setBackgroundSelected = (state: StreamState, selected: BackgroundType): StreamState => ({
    ...state,
    background: {
        ...state.background,
        selected
    }
})

const backgroundList: BackgroundSpec[] = [
    {
        key: 0,
        type: BackgroundType.Light,
        title: 'Light',
        icon: 'img/flow128.png',
    },
    {
        key: 1,
        type: BackgroundType.Dark,
        title: 'Dark',
        icon: 'img/flow128w.png',
    },
    {
        key: 2,
        type: BackgroundType.Ashfall,
        title: 'Ashfall',
        icon: 'img/flow128w.png',
    }
]

const getIcon = (type: BackgroundType): string => backgroundList[type].icon

export {
    initialState,
    backgroundList,
    getIcon,
    setState,
    setEnabled,
    setBackgroundExpanded,
    setBackgroundSelected
}