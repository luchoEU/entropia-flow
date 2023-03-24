import React from 'react'
import { useSelector } from 'react-redux'
import { refinedMarkupChanged, refinedSell, refinedValueChanged } from '../../application/actions/refined'
import { getMaterials } from '../../application/selectors/materials'
import { getCalculatorRefined, getRefined } from '../../application/selectors/refined'
import { MaterialsState } from '../../application/state/materials'
import { RefinedCalculatorState } from '../../application/state/refined'
import RefinedInput from './RefinedInput'
import RefinedMaterialInput from './RefinedMaterialInput'
import RefinedOutput from './RefinedOutput'

const RefinedMaterial = (p: {
    material: string
}) => {
    const { material } = p
    const state: RefinedCalculatorState = useSelector(getCalculatorRefined(material))

    return (
        <section>
            <h2>Calculator</h2>
            <form>
                { state.in.sourceMaterials.map(source =>
                    <RefinedMaterialInput name={source} />
                )}

                <RefinedMaterialInput name={state.in.refinedMaterial} />

                <RefinedInput
                    label='Value'
                    value={state.in.value}
                    unit='PED'
                    getChangeAction={refinedValueChanged(material)} />
            </form>
            <RefinedOutput
                out={state.out}
                sellAction={refinedSell(material)} />
        </section>
    )
}

export default RefinedMaterial

function getRefinedState(): (state: import("react-redux").DefaultRootState) => unknown {
    throw new Error('Function not implemented.')
}
