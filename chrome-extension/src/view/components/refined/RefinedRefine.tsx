import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getMaterial } from '../../application/selectors/materials'
import { RefinedOneState } from '../../application/state/refined'
import RefinedInput from './RefinedInput'
import RefinedButton from './RefinedButton'
import { MaterialState } from '../../application/state/materials'
import { refinedRefineMaterial, refinedUseMaterial } from '../../application/actions/refined'
import { materialRefineAmountChanged } from '../../application/actions/materials'

const RefinedUse = (p: {
    material: RefinedOneState
}) => {
    const { material } = p
    const dispatch = useDispatch()
    const m: MaterialState = useSelector(getMaterial(material.name))

    return (
        <section>
            <h2>Refine Material</h2>
            <form className='use-refined'>
                <RefinedInput
                    label={m.c.name}
                    value={m.refineAmount}
                    unit=''
                    getChangeAction={materialRefineAmountChanged(m.c.name)} />
                <RefinedButton title='Use' pending={false} action={refinedRefineMaterial(material.name, m.useAmount)} />
            </form>
        </section>
    )
}

export default RefinedUse
