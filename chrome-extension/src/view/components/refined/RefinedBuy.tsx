import React from 'react'
import { useSelector } from 'react-redux'
import { getItemsMap } from '../../application/selectors/items'
import { RefinedCalculatorState, RefinedOneState } from '../../application/state/refined'
import RefinedBuyMaterial from './RefinedBuyMaterial'
import { ItemsMap } from '../../application/state/items'

const RefinedBuy = (p: {
    material: RefinedOneState
}) => {
    const { material } = p
    const c: RefinedCalculatorState = material.calculator
    const m: ItemsMap = useSelector(getItemsMap)

    return (
        <section>
            <h2>Buy Material</h2>
            <div className='buy-refined'>
                <label>Material</label>
                <label>Markup</label>
                <label>Amount</label>
                <label>Cost</label>
                <label></label>

                { c.in.sourceMaterials.map(source =>
                    <RefinedBuyMaterial key={source} pageMaterial={material.name} buyMaterial={source} />
                )}
                <RefinedBuyMaterial pageMaterial={material.name} buyMaterial={c.in.refinedMaterial} />
            </div>
        </section>
    )
}

export default RefinedBuy
