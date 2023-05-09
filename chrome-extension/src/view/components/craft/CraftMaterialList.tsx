import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setCraftMaterialsExpanded } from '../../application/actions/craft'
import { getCraft } from '../../application/selectors/craft'
import { CraftState } from '../../application/state/craft'
import ExpandableSection from '../common/ExpandableSection'
import { MaterialsMap } from '../../application/state/materials'
import { getMaterialsMap } from '../../application/selectors/materials'

function CraftMaterialList() {
    const s: CraftState = useSelector(getCraft)
    const m: MaterialsMap = useSelector(getMaterialsMap)
    const dispatch = useDispatch()

    return (
        <ExpandableSection title='Budget Materials' expanded={s.materialsExpanded} setExpanded={setCraftMaterialsExpanded}>
            {Object.keys(m).map(k => 
                <div>{k}</div>
            )}
        </ExpandableSection>
    )
}

export default CraftMaterialList
