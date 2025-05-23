import React from 'react'
import { useSelector } from 'react-redux'
import { refinedValueChanged } from '../../application/actions/refined'
import { getItemsMap } from '../../application/selectors/items'
import { RefinedOneState } from '../../application/state/refined'
import RefinedInput from './RefinedInput'
import RefinedMaterialInput from './RefinedBuyMaterialInput'
import RefinedOutput from './RefinedOutput'
import { sheetPendingRefinedAuction } from '../../application/selectors/sheets'
import { refinedAuctionMaterial } from '../../application/actions/sheets'

const RefineCaculator = (p: {
    material: RefinedOneState
}) => {
    const { material } = p
    const c = material.calculator
    const m = useSelector(getItemsMap)
    const pending = useSelector(sheetPendingRefinedAuction(material.name))

    return (
        <section>
            <h2>Calculator</h2>
            <div className='calc-refined'>
                { c.in.sourceMaterials.map(source =>
                    <RefinedMaterialInput key={source} name={source} />
                )}

                <RefinedMaterialInput name={c.in.refinedMaterial} />

                <RefinedInput
                    label='Value'
                    value={c.in.value}
                    unit='PED'
                    getChangeAction={refinedValueChanged(material.name, m)} />
            </div>
            <RefinedOutput
                out={c.out}
                pending={pending}
                sellAction={refinedAuctionMaterial(material.name, c.out)} />
        </section>
    )
}

export default RefineCaculator
