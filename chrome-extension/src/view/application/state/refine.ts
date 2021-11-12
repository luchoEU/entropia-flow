interface RefineOneState {
    amount: string
}

interface RefineState {
    me: RefineOneState,
    lme: RefineOneState,
}

export {
    RefineOneState,
    RefineState
}
