interface UseOneState {
    amount: string,
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
