import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getMaterial } from '../../application/selectors/materials'
import { RefinedOneState } from '../../application/state/refined'
import RefinedInput from './RefinedInput'
import RefinedButton from './RefinedButton'
import { MaterialState } from '../../application/state/materials'
import { materialUseAmountChanged } from '../../application/actions/materials'
import { refinedUseMaterial } from '../../application/actions/sheets'

const RefinedUse = (p: {
    material: RefinedOneState
}) => {
    const { material } = p
    const m: MaterialState = useSelector(getMaterial(material.name))

    return (
        <section>
            <h2>Use Material</h2>
            <form className='use-refined'>
                <RefinedInput
                    label={m.c.name}
                    value={m.useAmount}
                    unit=''
                    getChangeAction={materialUseAmountChanged(m.c.name)} />
                <RefinedButton title='Use' pending={false} action={refinedUseMaterial(material.name, m.useAmount)} />
            </form>
        </section>
    )
}

export default RefinedUse
