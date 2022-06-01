interface RefineOneState {
    amount: string,
    pending: boolean
}

interface RefineState {
    me: RefineOneState,
    lme: RefineOneState,
}

export {
    RefineOneState,
    RefineState
}
