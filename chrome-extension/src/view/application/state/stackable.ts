interface StackableOneStateIn {
    ttValue: string,
    markup: string,
}

interface StackableOneStateOut {
    value: string
}

interface StackableStateIn {
    nexus: StackableOneStateIn,
    me: StackableOneStateIn,
    lme: StackableOneStateIn,
    nb: StackableOneStateIn,
    diluted: StackableOneStateIn,
    sweetstuff: StackableOneStateIn,
}

interface StackableStateOut {
    nexus: StackableOneStateOut,
    me: StackableOneStateOut,
    lme: StackableOneStateOut,
    nb: StackableOneStateOut,
    diluted: StackableOneStateOut,
    sweetstuff: StackableOneStateOut,
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