import React from 'react'
import { setRefinedExpanded } from '../../application/actions/refined'
import { RefinedOneState } from '../../application/state/refined'
import ExpandableSection from '../common/ExpandableSection'
import RefinedCalculator from './RefinedCalculator'

const RefinedMaterial = (p: {
    material: RefinedOneState
}) => {
    const { material } = p

    return (
        <>
            <ExpandableSection title={material.name} expanded={material.expanded} setExpanded={setRefinedExpanded(material.name)} >
                <RefinedCalculator material={material} />
            </ExpandableSection>
        </>
    )
}

export default RefinedMaterial