import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getItem } from '../../application/selectors/items'
import { RefinedOneState } from '../../application/state/refined'
import RefinedInput from './RefinedInput'
import RefinedButton from './RefinedButton'
import { ItemState } from '../../application/state/items'
import { itemOrderMarkupChanged, itemOrderValueChanged } from '../../application/actions/items'
import { refinedOrderMaterial } from '../../application/actions/sheets'

const RefinedOrder = (p: {
    material: RefinedOneState
}) => {
    const { material } = p
    const dispatch = useDispatch()
    const m: ItemState = useSelector(getItem(material.name))

    return (
        <section>
            <h2>Order Material</h2>
            <div className='order-refined'>
                <div /><div>Markup</div><div /><div>PED</div><div />
                <RefinedInput
                    label={m.name}
                    value={m.refined.orderMarkup}
                    unit={m.markup.unit}
                    getChangeAction={itemOrderMarkupChanged(m.name)} />
                <input
                    type='text'
                    value={m.refined.orderValue}
                    onChange={(e) => dispatch(itemOrderValueChanged(material.name, e.target.value))} />

                <RefinedButton title='Order' pending={false} action={refinedOrderMaterial(material.name, m.refined.orderValue, m.refined.orderMarkup)} />
            </div>
        </section>
    )
}

export default RefinedOrder
