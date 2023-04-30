import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getMaterial } from '../../application/selectors/materials'
import { RefinedOneState } from '../../application/state/refined'
import RefinedInput from './RefinedInput'
import RefinedButton from './RefinedButton'
import { MaterialState } from '../../application/state/materials'
import { materialRefineAmountChanged } from '../../application/actions/materials'
import { refinedRefineMaterial } from '../../application/actions/sheets'
import { sheetPendingRefinedRefine } from '../../application/selectors/sheets'

const RefinedUse = (p: {
    material: RefinedOneState
}) => {
    const { material } = p
    const m: MaterialState = useSelector(getMaterial(material.name))
    const pending = useSelector(sheetPendingRefinedRefine(material.name))
    const source = material.calculator.in.sourceMaterials.map(name =>
        ({
            name,
            quantity: -Number(m.refineAmount) * m.c.kValue / useSelector(getMaterial(name)).c.kValue
        }))

    return (
        <section>
            <h2>Refine Material</h2>
            <div className='use-refined'>
                <RefinedInput
                    label={m.c.name}
                    value={m.refineAmount}
                    unit=''
                    getChangeAction={materialRefineAmountChanged(m.c.name)} />
                <RefinedButton title='Refine' pending={pending} action={refinedRefineMaterial(material.name, m.refineAmount, source)} />
            </div>
        </section>
    )
}

export default RefinedUse
