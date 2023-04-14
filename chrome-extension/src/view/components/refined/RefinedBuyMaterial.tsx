import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { materialBuyAmountChanged } from '../../application/actions/materials'
import { getMaterial } from '../../application/selectors/materials'
import { MaterialState } from '../../application/state/materials'
import RefinedButton from './RefinedButton'
import RefinedBuyMaterialInput from './RefinedBuyMaterialInput'
import { refinedBuyMaterial } from '../../application/actions/sheets'

const RefinedBuyMaterial = (p: {
    name: string
}) => {
    const dispatch = useDispatch()
    const m: MaterialState = useSelector(getMaterial(p.name))

    return (
        <>
            <RefinedBuyMaterialInput name={p.name} />
            <input
                type='text'
                value={m.buyAmount}
                onChange={(e) => dispatch(materialBuyAmountChanged(p.name, e.target.value))} />
            <RefinedButton title='Buy' pending={false} action={refinedBuyMaterial(p.name, m.buyAmount, m.buyMarkup)} />
        </>
    )
}

export default RefinedBuyMaterial
