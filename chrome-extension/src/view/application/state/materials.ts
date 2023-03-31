interface MaterialsState {
    map: MaterialsMap
}

type MaterialsMap = { [name: string] : MaterialState }

interface MaterialState {    
    markup: string,
    buyAmount: string,

    // constants
    c: {
        name: string,
        unit: string, // of markup
        kValue: number // TT value in PED of 1k
    }
}

export {
    MaterialsState,
    MaterialsMap,
    MaterialState
}