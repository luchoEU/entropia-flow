import React from 'react'
import { useSelector } from 'react-redux'
import { refinedSell, refinedValueChanged } from '../../application/actions/refined'
import { getMaterialsMap } from '../../application/selectors/materials'
import { RefinedOneState } from '../../application/state/refined'
import RefinedInput from './RefinedInput'
import RefinedMaterialInput from './RefinedMaterialInput'
import RefinedOutput from './RefinedOutput'

const RefinedMaterial = (p: {
    material: RefinedOneState
}) => {
    const { material } = p
    const c = material.calculator
    const m = useSelector(getMaterialsMap)

    return (
        <section>
            <h2>Calculator</h2>
            <form>
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
                sellAction={refinedSell(material.name)} />
        </section>
    )
}

export default RefinedMaterial
