import { AboutState, FEEDBACK, SOURCECODE, TUTORIALS } from "../state/about"

const initialState: AboutState = {
    expanded: [FEEDBACK, TUTORIALS, SOURCECODE]
}

const setState = (state: AboutState, newState: AboutState): AboutState => newState

const setExpanded = (state: AboutState, part: string, expanded: boolean): AboutState => ({
    ...state,
    expanded: expanded ? [...state.expanded, part] : state.expanded.filter(x => x != part)
})

export {
    initialState,
    setState,
    setExpanded
}