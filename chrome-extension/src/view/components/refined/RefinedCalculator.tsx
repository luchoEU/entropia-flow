import React from 'react'
import { useSelector } from 'react-redux'
import { refinedMarkupChanged, refinedSell, refinedValueChanged } from '../../application/actions/refined'
import { getCalculatorRefined, getOneRefined } from '../../application/selectors/refined'
import { RefinedCalculatorState, RefinedOneState } from '../../application/state/refined'
import RefinedInput from './RefinedInput'
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
                <RefinedInput
                    label='Markup'
                    value={state.in.markup}
                    unit='%'
                    getChangeAction={refinedMarkupChanged(material)} />

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