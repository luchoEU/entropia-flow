import React from 'react'
import BudgetMaterialList from './BudgetMaterialList'
import BudgetDisabledList from './BudgetDisabledList'
import BudgetItemList from './BudgetItemList'

function BudgetPage() {
    return <>
        <BudgetItemList />
        <BudgetMaterialList />
        <BudgetDisabledList />
    </>
}

export default BudgetPage