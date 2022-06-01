interface StackableOneStateIn {
    ttValue: string,
    markup: string,
    pending: boolean
}

interface StackableOneStateOut {
    value: string
}

interface StackableStateIn {
    nexus: StackableOneStateIn,
    me: StackableOneStateIn,
    lme: StackableOneStateIn,
    diluted: StackableOneStateIn,
}

interface StackableStateOut {
    nexus: StackableOneStateOut,
    me: StackableOneStateOut,
    lme: StackableOneStateOut,
    diluted: StackableOneStateOut,
}

interface StackableState {
    in: StackableStateIn,
    out: StackableStateOut
}

export {
    StackableState,
    StackableStateIn,
    StackableStateOut,
    StackableOneStateIn,
    StackableOneStateOut
}