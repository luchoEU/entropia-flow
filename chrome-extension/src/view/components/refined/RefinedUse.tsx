import React from 'react'
import { useSelector } from 'react-redux'
import { getItem } from '../../application/selectors/items'
import { RefinedOneState } from '../../application/state/refined'
import RefinedInput from './RefinedInput'
import RefinedButton from './RefinedButton'
import { ItemState } from '../../application/state/items'
import { itemUseAmountChanged } from '../../application/actions/items'
import { refinedUseMaterial } from '../../application/actions/sheets'

const RefinedUse = (p: {
    material: RefinedOneState
}) => {
    const { material } = p
    const m: ItemState = useSelector(getItem(material.name))

    return (
        <section>
            <h2>Use Material</h2>
            <div className='use-refined'>
                <RefinedInput
                    label={m.name}
                    value={m.refined.useAmount}
                    unit=''
                    getChangeAction={itemUseAmountChanged(m.name)} />
                <RefinedButton title='Use' pending={false} action={refinedUseMaterial(material.name, m.refined.useAmount)} />
            </div>
        </section>
    )
}

export default RefinedUse
