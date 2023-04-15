import React from 'react'
import { useSelector } from 'react-redux'
import { refinedSell, refinedValueChanged } from '../../application/actions/refined'
import { getMaterialsMap } from '../../application/selectors/materials'
import { RefinedOneState } from '../../application/state/refined'
import RefinedInput from './RefinedInput'
import RefinedMaterialInput from './RefinedBuyMaterialInput'
import RefinedOutput from './RefinedOutput'
import { sheetPendingRefinedBuy } from '../../application/selectors/sheets'

const RefinedMaterial = (p: {
    material: RefinedOneState
}) => {
    const { material } = p
    const c = material.calculator
    const m = useSelector(getMaterialsMap)
    const pending = useSelector(sheetPendingRefinedBuy(material.name))

    return (
        <section>
            <h2>Calculator</h2>
            <form className='calc-refined'>
                { c.in.sourceMaterials.map(source =>
                    <RefinedMaterialInput key={source} name={source} />
                )}

                <RefinedMaterialInput name={c.in.refinedMaterial} />

                <RefinedInput
                    label='Value'
                    value={c.in.value}
                    unit='PED'
                    getChangeAction={refinedValueChanged(material.name, m)} />
            </form>
            <RefinedOutput
                out={c.out}
                pending={pending}
                sellAction={refinedSell(material.name)} />
        </section>
    )
}

export default RefinedMaterial
