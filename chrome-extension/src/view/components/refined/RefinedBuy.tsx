import React from 'react'
import { useSelector } from 'react-redux'
import { getMaterialsMap } from '../../application/selectors/materials'
import { RefinedCalculatorState, RefinedOneState } from '../../application/state/refined'
import RefinedBuyMaterial from './RefinedBuyMaterial'
import { MaterialsMap } from '../../application/state/materials'

const RefinedBuy = (p: {
    material: RefinedOneState
}) => {
    const { material } = p
    const c: RefinedCalculatorState = material.calculator
    const m: MaterialsMap = useSelector(getMaterialsMap)

    return (
        <section>
            <h2>Buy Material</h2>
            <form className='buy-refined'>
                <div /><div>Markup</div><div /><div>Amount</div><div />
                { c.in.sourceMaterials.map(source =>
                    <RefinedBuyMaterial key={source} name={source} />
                )}

                <RefinedBuyMaterial name={c.in.refinedMaterial} /><div />
            </form>
        </section>
    )
}

export default RefinedBuy
