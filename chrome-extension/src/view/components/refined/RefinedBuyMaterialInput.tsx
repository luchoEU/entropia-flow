import React from 'react'
import { useSelector } from 'react-redux'
import { itemBuyMarkupChanged } from '../../application/actions/items'
import { getItem } from '../../application/selectors/items'
import { ItemState } from '../../application/state/items'
import RefinedInput from './RefinedInput'

function RefinedBuyMaterialInput(p: {
    name: string,
}) {
    const m: ItemState = useSelector(getItem(p.name))

    return (
        <>
            <RefinedInput
                label={m.name}
                value={m.markup.value}
                unit={m.markup.unit}
                getChangeAction={itemBuyMarkupChanged(m.name)} />
        </>
    )
}

export default RefinedBuyMaterialInput
