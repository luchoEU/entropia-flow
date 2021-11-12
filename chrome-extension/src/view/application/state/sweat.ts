interface SweatStateIn {
    price: string,
    amount: string,
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