import React from 'react'
import { refinedSell, refinedValueChanged } from '../../application/actions/refined'
import { RefinedOneState } from '../../application/state/refined'
import RefinedInput from './RefinedInput'
import RefinedMaterialInput from './RefinedMaterialInput'
import RefinedOutput from './RefinedOutput'

const RefinedMaterial = (p: {
    material: RefinedOneState
}) => {
    const { material } = p
    const c = material.calculator

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
                    getChangeAction={refinedValueChanged(material.name)} />
            </form>
            <RefinedOutput
                out={c.out}
                sellAction={refinedSell(material.name)} />
        </section>
    )
}

export default RefinedMaterial

function getRefinedState(): (state: import("react-redux").DefaultRootState) => unknown {
    throw new Error('Function not implemented.')
}
