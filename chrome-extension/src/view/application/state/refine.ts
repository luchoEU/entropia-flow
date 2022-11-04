interface RefineOneState {
    amount: string,
    pending: boolean
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
