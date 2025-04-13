import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { itemBuyAmountChanged, itemBuyMarkupChanged } from '../../application/actions/items'
import { getItem } from '../../application/selectors/items'
import { ItemState } from '../../application/state/items'
import RefinedButton from './RefinedButton'
import { refinedBuyMaterial } from '../../application/actions/sheets'
import { sheetPendingRefinedBuy } from '../../application/selectors/sheets'
import { getMarkupMultiplier } from '../../application/helpers/items'

const RefinedBuyMaterial = (p: {
    pageMaterial: string,
    buyMaterial: string
}) => {
    const dispatch = useDispatch()
    const m: ItemState = useSelector(getItem(p.buyMaterial))
    const pending = useSelector(sheetPendingRefinedBuy(p.pageMaterial, p.buyMaterial))

    const kAmount = Number(m.refined.buyAmount) / 1000
    const nMarkup = getMarkupMultiplier(m)
    const cost = kAmount * m.refined.kValue * nMarkup

    return (
        <>
            <label>{m.name}</label>
            <div>
                <input
                    type='text'
                    value={m.markup.value}
                    onChange={(e) => dispatch(itemBuyMarkupChanged(m.name)(e.target.value))} />
                <label>{m.markup.unit}</label>
            </div>
            <input
                type='text'
                value={m.refined.buyAmount}
                onChange={(e) => dispatch(itemBuyAmountChanged(p.buyMaterial, e.target.value))} />
            <div>{cost.toFixed(2)} PED</div>
            <RefinedButton title='Buy' pending={pending} action={refinedBuyMaterial(p.pageMaterial, p.buyMaterial, m.refined.buyAmount, cost)} />
        </>
    )
}

export default RefinedBuyMaterial
