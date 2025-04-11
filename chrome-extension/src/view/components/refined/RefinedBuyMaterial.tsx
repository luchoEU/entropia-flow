import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { materialBuyAmountChanged, materialBuyMarkupChanged } from '../../application/actions/materials'
import { getMaterial } from '../../application/selectors/materials'
import { MaterialState } from '../../application/state/materials'
import RefinedButton from './RefinedButton'
import { refinedBuyMaterial } from '../../application/actions/sheets'
import { sheetPendingRefinedBuy } from '../../application/selectors/sheets'
import { getMarkupMultiplier } from '../../application/helpers/materials'

const RefinedBuyMaterial = (p: {
    pageMaterial: string,
    buyMaterial: string
}) => {
    const dispatch = useDispatch()
    const m: MaterialState = useSelector(getMaterial(p.buyMaterial))
    const pending = useSelector(sheetPendingRefinedBuy(p.pageMaterial, p.buyMaterial))

    const kAmount = Number(m.buyAmount) / 1000
    const nMarkup = getMarkupMultiplier(m)
    const cost = kAmount * m.c.kValue * nMarkup

    return (
        <>
            <label>{m.c.name}</label>
            <div>
                <input
                    type='text'
                    value={m.buyMarkup}
                    onChange={(e) => dispatch(materialBuyMarkupChanged(m.c.name)(e.target.value))} />
                <label>{m.markupUnit}</label>
            </div>
            <input
                type='text'
                value={m.buyAmount}
                onChange={(e) => dispatch(materialBuyAmountChanged(p.buyMaterial, e.target.value))} />
            <div>{cost.toFixed(2)} PED</div>
            <RefinedButton title='Buy' pending={pending} action={refinedBuyMaterial(p.pageMaterial, p.buyMaterial, m.buyAmount, cost)} />
        </>
    )
}

export default RefinedBuyMaterial
