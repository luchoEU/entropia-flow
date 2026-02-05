import React, { useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { useAtomValue, useSetAtom } from 'jotai'
import { itemOrderMarkupChangedAtom, itemOrderValueChangedAtom, getItemAtom } from '../../application/atoms/items'
import { RefinedOneState } from '../../application/state/refined'
import RefinedInput from './RefinedInput'
import RefinedButton from './RefinedButton'
import { ItemState } from '../../application/state/items'
import { refinedOrderMaterial } from '../../application/actions/sheets'

const RefinedOrder = (p: {
    material: RefinedOneState
}) => {
    const { material } = p
    const dispatch = useDispatch()
    const itemAtom = useMemo(() => getItemAtom(material.name), [material.name])
    const m: ItemState = useAtomValue(itemAtom)
    const setMarkup = useSetAtom(itemOrderMarkupChangedAtom)
    const setValue = useSetAtom(itemOrderValueChangedAtom)

    return (
        <section>
            <h2>Order Material</h2>
            <div className='order-refined'>
                <div /><div>Markup</div><div /><div>PED</div><div />
                <RefinedInput
                    label={m.name}
                    value={m.refined.orderMarkup}
                    unit={m.markup.unit}
                    getChangeAction={(value) => setMarkup(m.name, value)} />
                <input
                    type='text'
                    value={m.refined.orderValue}
                    onChange={(e) => setValue(material.name, e.target.value)} />

                <RefinedButton title='Order' pending={false} action={refinedOrderMaterial(material.name, m.refined.orderValue, m.refined.orderMarkup)} />
            </div>
        </section>
    )
}

export default RefinedOrder
