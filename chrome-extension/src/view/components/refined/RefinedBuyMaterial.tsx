import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { materialBuyAmountChanged } from '../../application/actions/materials'
import { getMaterial } from '../../application/selectors/materials'
import { MaterialState } from '../../application/state/materials'
import RefinedButton from './RefinedButton'
import RefinedBuyMaterialInput from './RefinedBuyMaterialInput'
import { refinedBuyMaterial } from '../../application/actions/sheets'
import { sheetPendingRefinedBuy } from '../../application/selectors/sheets'

const RefinedBuyMaterial = (p: {
    pageMaterial: string,
    buyMaterial: string
}) => {
    const dispatch = useDispatch()
    const m: MaterialState = useSelector(getMaterial(p.buyMaterial))
    const pending = useSelector(sheetPendingRefinedBuy(p.pageMaterial, p.buyMaterial))

    return (
        <>
            <RefinedBuyMaterialInput name={p.buyMaterial} />
            <input
                type='text'
                value={m.buyAmount}
                onChange={(e) => dispatch(materialBuyAmountChanged(p.buyMaterial, e.target.value))} />
            <RefinedButton title='Buy' pending={pending} action={refinedBuyMaterial(p.pageMaterial, p.buyMaterial, m.buyAmount, m.buyMarkup, m.c.unit, m.c.kValue)} />
        </>
    )
}

export default RefinedBuyMaterial
