import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { materialBuyAmountChanged } from '../../application/actions/materials'
import { refinedBuyMaterial } from '../../application/actions/refined'
import { getMaterial } from '../../application/selectors/materials'
import { MaterialState } from '../../application/state/materials'
import RefinedButton from './RefinedButton'
import RefinedMaterialInput from './RefinedMaterialInput'

const RefinedBuyMaterial = (p: {
    name: string
}) => {
    const dispatch = useDispatch()
    const m: MaterialState = useSelector(getMaterial(p.name))

    return (
        <>
            <RefinedMaterialInput name={p.name} />
            <input
                type='text'
                value={m.buyAmount}
                onChange={(e) => dispatch(materialBuyAmountChanged(p.name, e.target.value))} />
            <RefinedButton title='Buy' pending={false} action={refinedBuyMaterial(p.name, m.buyAmount, m.markup)} />
        </>
    )
}

export default RefinedBuyMaterial
