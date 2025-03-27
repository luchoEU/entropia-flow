import React from 'react'
import { RefinedOneState } from '../../application/state/refined'
import ExpandableSection from '../common/ExpandableSection2'
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
            <ExpandableSection selector={`RefinedMaterial.${material.name}`} title={material.name} subtitle={`Tools for ${material.name} material`}>
                <RefinedCalculator material={material} />
                <RefinedBuy material={material} />
                <RefinedRefine material={material} />
                <RefinedOrder material={material} />
                <RefinedUse material={material} />
            </ExpandableSection>
        </>
    )
}

export default RefinedMaterial