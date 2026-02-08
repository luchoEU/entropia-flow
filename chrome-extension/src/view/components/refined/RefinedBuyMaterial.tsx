import React, { useMemo } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { setItemBuyAmountAtom, setItemBuyMarkupAtom, getItemAtom } from '../../application/atoms/items'
import { ItemState } from '../../application/state/items'
import RefinedButton from './RefinedButton'
import { getMarkupMultiplier } from '../../application/helpers/items'

const RefinedBuyMaterial = (p: {
    pageMaterial: string,
    buyMaterial: string
}) => {
    const itemAtom = useMemo(() => getItemAtom(p.buyMaterial), [p.buyMaterial])
    const m: ItemState = useAtomValue(itemAtom)
    const setMarkup = useSetAtom(setItemBuyMarkupAtom)
    const setAmount = useSetAtom(setItemBuyAmountAtom)

    const kAmount = Number(m.refined.buyAmount) / 1000
    const nMarkup = getMarkupMultiplier(m)
    const cost = kAmount * m.refined.kValue * nMarkup

    return (
        <>
            <label>{p.buyMaterial}</label>
            <div className='buy-refined-markup'>
                <input
                    type='text'
                    value={m.markup.value}
                    onChange={(e) => setMarkup(p.buyMaterial, e.target.value)} />
                <span>{m.markup.unit}</span>
            </div>
            <input
                type='text'
                value={m.refined.buyAmount}
                onChange={(e) => setAmount(p.buyMaterial, e.target.value)} />
            <div className='buy-refined-cost'>{cost.toFixed(2)} PED</div>
            <RefinedButton title='Buy' pending={false} onClick={() => console.log('TODO: Buy refined material')} />
        </>
    )
}

export default RefinedBuyMaterial
