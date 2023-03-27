import React from 'react'
import { useSelector } from 'react-redux'
import { getMaterialsMap } from '../../application/selectors/materials'
import { RefinedOneState } from '../../application/state/refined'
import RefinedBuyMaterial from './RefinedBuyMaterial'
import RefinedMaterialInput from './RefinedMaterialInput'

const RefinedBuy = (p: {
    material: RefinedOneState
}) => {
    const { material } = p
    const c = material.calculator
    const m = useSelector(getMaterialsMap)

    return (
        <section>
            <h2>Buy Material</h2>
            <form className='buy-refined'>
                <div /><div /><div /><div>Amount</div>
                { c.in.sourceMaterials.map(source =>
                    <RefinedBuyMaterial key={source} name={source} />
                )}

                <RefinedMaterialInput name={c.in.refinedMaterial} /><div />
            </form>
        </section>
    )
}

export default RefinedBuy
