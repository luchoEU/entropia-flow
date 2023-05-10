import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ExpandableSection from '../common/ExpandableSection'
import { MaterialsMap, MaterialsState } from '../../application/state/materials'
import { getMaterials } from '../../application/selectors/materials'
import { refreshMaterialCraftBudgets, setMaterialCraftListExpanded, setMaterialCraftExpanded } from '../../application/actions/materials'
import { getMaterialsMap } from '../../application/selectors/materials'

function CraftMaterialList() {
    const s: MaterialsState = useSelector(getMaterials)
    const m: MaterialsMap = useSelector(getMaterialsMap)
    const dispatch = useDispatch()

    return (
        <ExpandableSection title='Budget Materials' expanded={s.craftBudgetExpanded} setExpanded={setMaterialCraftListExpanded}>
            {Object.keys(m).map(k => {
                m[k].craftBudgetTotal > 0 ?            
                    <ExpandableSection title={`${m[k].craftBudgetTotal} ${k}`} expanded={m[k].craftBudgetExpanded} setExpanded={setMaterialCraftExpanded(k)}>
                        <table>
                            {m[k].craftBudgetList.map(b =>
                                <tr>
                                    <td>{b.name}</td>
                                    <td>{b.quantity}</td>
                                </tr>
                        )}
                        </table>
                    </ExpandableSection> : <></>
            })}
            <button onClick={() => dispatch(refreshMaterialCraftBudgets)}>Refresh</button>
        </ExpandableSection>
    )
}

export default CraftMaterialList
