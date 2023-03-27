import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { materialBuyAmountChanged } from '../../application/actions/materials'
import { getMaterial } from '../../application/selectors/materials'
import { MaterialState } from '../../application/state/materials'
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
        </>
    )
}

export default RefinedBuyMaterial
