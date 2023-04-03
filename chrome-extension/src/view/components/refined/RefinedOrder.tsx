import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getMaterial } from '../../application/selectors/materials'
import { RefinedOneState } from '../../application/state/refined'
import RefinedInput from './RefinedInput'
import RefinedButton from './RefinedButton'
import { MaterialState } from '../../application/state/materials'
import { materialOrderMarkupChanged, materialOrderValueChanged } from '../../application/actions/materials'
import { refinedOrderMaterial } from '../../application/actions/refined'

const RefinedOrder = (p: {
    material: RefinedOneState
}) => {
    const { material } = p
    const dispatch = useDispatch()
    const m: MaterialState = useSelector(getMaterial(material.name))

    return (
        <section>
            <h2>Order Material</h2>
            <form className='buy-refined'>
                <div /><div>Markup</div><div /><div>PED</div><div />
                <RefinedInput
                    label={m.c.name}
                    value={m.orderMarkup}
                    unit={m.c.unit}
                    getChangeAction={materialOrderMarkupChanged(m.c.name)} />
                <input
                    type='text'
                    value={m.orderValue}
                    onChange={(e) => dispatch(materialOrderValueChanged(material.name, e.target.value))} />

                <RefinedButton title='Order' pending={false} action={refinedOrderMaterial(material.name, m.orderValue, m.orderMarkup)} />
            </form>
        </section>
    )
}

export default RefinedOrder
