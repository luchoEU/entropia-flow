import React from 'react'
import BudgetMaterialList from './BudgetMaterialList'
import BudgetControl from './BudgetControl'
import BudgetDisabledList from './BudgetDisabledList'
import BudgetItemList from './BudgetItemList'

function BudgetPage() {
    return <>
        <BudgetControl />
        <BudgetItemList />
        <BudgetDisabledList />
        <BudgetMaterialList />
    </>
}

export default BudgetPage