import React from 'react'
import { useSelector } from 'react-redux'
import { setRefinedExpanded } from '../../application/actions/refined'
import { refinedTitle } from '../../application/helpers/refined'
import { getOneRefined } from '../../application/selectors/refined'
import { RefinedOneState } from '../../application/state/refined'
import ExpandableSection from '../common/ExpandableSection'
import RefinedCalculator from './RefinedCalculator'

const RefinedMaterial = (p: {
    material: string
}) => {
    const { material } = p
    const state: RefinedOneState = useSelector(getOneRefined(material))

    return (
        <>
            <ExpandableSection title={refinedTitle[material]} expanded={state.expanded} setExpanded={setRefinedExpanded(material)} >
                <RefinedCalculator material={material} />
            </ExpandableSection>
        </>
    )
}

export default RefinedMaterial