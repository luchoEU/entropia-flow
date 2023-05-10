interface MaterialsState {
    map: MaterialsMap,
    craftBudgetExpanded: boolean,
    craftBudgetStage: number
}

type MaterialsMap = { [name: string] : MaterialState }

interface MaterialState {    
    buyMarkup: string,
    buyAmount: string,
    orderMarkup?: string,
    orderValue?: string,
    useAmount?: string,
    refineAmount?: string,
    craftBudgetExpanded: boolean,
    craftBudgetTotal: number,
    craftBudgetList: MaterialBudget[]

    // constants
    c: {
        name: string,
        unit: string, // of markup
        kValue: number // TT value in PED of 1k
    }
}

interface MaterialBudget {
    name: string
    quantity: number
}

export {
    MaterialsState,
    MaterialsMap,
    MaterialState,
}
