import React from 'react'
import { setRefinedExpanded } from '../../application/actions/refined'
import { RefinedOneState } from '../../application/state/refined'
import ExpandableSection from '../common/ExpandableSection'
import RefinedBuy from './RefinedBuy'
import RefinedCalculator from './RefinedCalculator'
import RefinedOrder from './RefinedOrder'
import RefinedUse from './RefinedUse'
import RefinedRefine from './RefinedRefine'

const RefinedMaterial = (p: {
    material: RefinedOneState
}) => {
    const { material } = p

    return (
        <>
            <ExpandableSection title={material.name} expanded={material.expanded} setExpanded={setRefinedExpanded(material.name)} >
                <RefinedCalculator material={material} />
                <RefinedBuy material={material} />
                <RefinedOrder material={material} />
                <RefinedUse material={material} />
                <RefinedRefine material={material} />
            </ExpandableSection>
        </>
    )
}

export default RefinedMaterial