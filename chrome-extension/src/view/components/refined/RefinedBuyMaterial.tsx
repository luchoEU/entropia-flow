import React, { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useAtomValue, useSetAtom } from 'jotai'
import { itemBuyAmountChangedAtom, itemBuyMarkupChangedAtom, getItemAtom } from '../../application/atoms/items'
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
    const itemAtom = useMemo(() => getItemAtom(p.buyMaterial), [p.buyMaterial])
    const m: ItemState = useAtomValue(itemAtom)
    const setMarkup = useSetAtom(itemBuyMarkupChangedAtom)
    const setAmount = useSetAtom(itemBuyAmountChangedAtom)
    const pending = useSelector(sheetPendingRefinedBuy(p.pageMaterial, p.buyMaterial))

    const kAmount = Number(m.refined.buyAmount) / 1000
    const nMarkup = getMarkupMultiplier(m)
    const cost = kAmount * m.refined.kValue * nMarkup

    return (
        <>
            <label>{m.name}</label>
            <div className='buy-refined-markup'>
                <input
                    type='text'
                    value={m.markup.value}
                    onChange={(e) => setMarkup(m.name, e.target.value)} />
                <span>{m.markup.unit}</span>
            </div>
            <input
                type='text'
                value={m.refined.buyAmount}
                onChange={(e) => setAmount(p.buyMaterial, e.target.value)} />
            <div className='buy-refined-cost'>{cost.toFixed(2)} PED</div>
            <RefinedButton title='Buy' pending={pending} action={refinedBuyMaterial(p.pageMaterial, p.buyMaterial, m.refined.buyAmount, cost)} />
        </>
    )
}

export default RefinedBuyMaterial
