interface MaterialsState {
    map: MaterialsMap,
    craftBudget: MaterialsCraftBudget
}

type MaterialsMap = { [name: string] : MaterialState }

interface MaterialState {    
    buyMarkup: string,
    buyAmount: string,
    orderMarkup?: string,
    orderValue?: string,
    useAmount?: string,
    refineAmount?: string,

    // constants
    c: {
        name: string,
        unit: string, // of markup
        kValue: number // TT value in PED of 1k
    }
}

interface MaterialsCraftBudget {
    expanded: boolean,
    stage: number,
    map: MaterialsCraftMap
}

type MaterialsCraftMap = { [name: string] : MaterialCraftState }

interface MaterialCraftState {
    expanded: boolean,
    total: number,
    list: MaterialBudget[]
}

interface MaterialBudget {
    itemName: string
    quantity: number
}

export {
    MaterialsState,
    MaterialsMap,
    MaterialsCraftMap,
    MaterialState,
}
