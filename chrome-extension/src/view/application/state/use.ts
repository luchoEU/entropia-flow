interface UseOneState {
    amount: string,
    pending: boolean
}

interface UseState {
    me: UseOneState,
    lme: UseOneState,
    nb: UseOneState,
}

export {
    UseOneState,
    UseState
}
