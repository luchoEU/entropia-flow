import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getMaterial } from '../../application/selectors/materials'
import { RefinedOneState } from '../../application/state/refined'
import RefinedInput from './RefinedInput'
import RefinedButton from './RefinedButton'
import { MaterialState } from '../../application/state/materials'
import { materialRefineAmountChanged } from '../../application/actions/materials'
import { refinedUseMaterial } from '../../application/actions/sheets'

const RefinedUse = (p: {
    material: RefinedOneState
}) => {
    const { material } = p
    const dispatch = useDispatch()
    const m: MaterialState = useSelector(getMaterial(material.name))

    return (
        <section>
            <h2>Refine Material</h2>
            <div className='use-refined'>
                <RefinedInput
                    label={m.c.name}
                    value={m.refineAmount}
                    unit=''
                    getChangeAction={materialRefineAmountChanged(m.c.name)} />
                <RefinedButton title='Use' pending={false} action={refinedUseMaterial(material.name, m.useAmount)} />
            </div>
        </section>
    )
}

export default RefinedUse
