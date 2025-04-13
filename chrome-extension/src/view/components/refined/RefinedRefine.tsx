import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getItem } from '../../application/selectors/items'
import { RefinedOneState } from '../../application/state/refined'
import RefinedInput from './RefinedInput'
import RefinedButton from './RefinedButton'
import { ItemState } from '../../application/state/items'
import { itemRefineAmountChanged } from '../../application/actions/items'
import { refinedRefineMaterial } from '../../application/actions/sheets'
import { sheetPendingRefinedRefine } from '../../application/selectors/sheets'

const RefinedUse = (p: {
    material: RefinedOneState
}) => {
    const { material } = p
    const m: ItemState = useSelector(getItem(material.name))
    const pending = useSelector(sheetPendingRefinedRefine(material.name))
    const materials = material.refine ? material.refine.map(s =>
        ({
            name: s.name,
            quantity: Number(m.refined.refineAmount) * s.mult
        })) : []

    return (
        <section>
            <h2>Refine Material</h2>
            <div className='use-refined'>
                <RefinedInput
                    label={m.name}
                    value={m.refined.refineAmount}
                    unit=''
                    getChangeAction={itemRefineAmountChanged(m.name)} />
                <RefinedButton title='Refine' pending={pending} action={refinedRefineMaterial(material.name, materials)} />
            </div>
        </section>
    )
}

export default RefinedUse
