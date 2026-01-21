import React from 'react'
import BudgetMaterialList from './BudgetMaterialList'
import BudgetDisabledList from './BudgetDisabledList'
import BudgetItemList from './BudgetItemList'
import { formatFromUrl } from '../../application/helpers/navigation'
import { useParams } from 'react-router-dom'

function BudgetPage() {
    const { itemName, materialName } = useParams()
    const decodedItemName = formatFromUrl(itemName || '')
    const decodedMaterialName = formatFromUrl(materialName || '')

    return <>
        <BudgetItemList selected={decodedItemName || null} selectedMaterial={decodedMaterialName || null}/>
        <BudgetMaterialList />
        <BudgetDisabledList />
    </>
}

export default BudgetPage