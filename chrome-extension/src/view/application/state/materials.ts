interface MaterialsState {
    map: MaterialsMap
}

type MaterialsMap = { [name: string] : MaterialState }

interface MaterialState {    
    name: string,
    markup: string,

    // constants
    unit: string, // of markup
    kValue: number // TT value in PED of 1k
}

export {
    MaterialsState,
    MaterialsMap,
    MaterialState
}