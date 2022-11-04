interface SweatStateIn {
    price: string,
    amount: string,
    pending: boolean
}

interface SweatStateOut {
    value: string
}

interface SweatState {
    in: SweatStateIn,
    out: SweatStateOut
}

export {
    SweatState,
    SweatStateIn,
    SweatStateOut
}
