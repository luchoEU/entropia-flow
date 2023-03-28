interface RefineOneState {
    amount: string,
}

interface RefineState {
    me: RefineOneState,
    lme: RefineOneState,
    nb: RefineOneState,
}

export {
    RefineOneState,
    RefineState
}
