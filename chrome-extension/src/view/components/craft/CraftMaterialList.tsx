import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { MaterialsCraftMap, MaterialsState } from '../../application/state/materials'
import { getMaterials } from '../../application/selectors/materials'
import { refreshMaterialCraftBudgets, setMaterialCraftListExpanded, setMaterialCraftExpanded } from '../../application/actions/materials'
import { STAGE_INITIALIZING, StageText } from '../../services/api/sheets/sheetsStages'
import ExpandableSection from '../common/ExpandableSection'

const ExpandableMaterial = (p: {
    quantity: number,
    name: string,
    expanded: boolean,
    setExpanded: (expanded: boolean) => any,
    children: any
}) => {
    const dispatch = useDispatch()

    return (
        <div className='craft-material'>
            <h3>
                <div>{p.quantity}</div>
                <div>{p.name}</div>
                {p.expanded ?
                    <img className='hide' src='img/up.png' onClick={() => dispatch(p.setExpanded(false))} /> :
                    <img src='img/down.png' onClick={() => dispatch(p.setExpanded(true))} />}
            </h3>
            {
                p.expanded ? p.children : ''
            }
        </div>
    )
}

function CraftMaterialList() {
    const s: MaterialsState = useSelector(getMaterials)
    const m: MaterialsCraftMap = s.craftBudget.map
    const dispatch = useDispatch()

    return (
        <ExpandableSection title='Budget Materials' expanded={s.craftBudget.expanded} setExpanded={setMaterialCraftListExpanded}>
            { s.craftBudget.stage === STAGE_INITIALIZING ? '' : <p>{StageText[s.craftBudget.stage]}...</p> }
            { Object.keys(m).map(k => 
                m[k].total > 0 ?
                    <ExpandableMaterial key={k} quantity={m[k].total} name={k} expanded={m[k].expanded} setExpanded={setMaterialCraftExpanded(k)}>
                        <table>
                            { m[k].list.map(b =>
                                <tr key={`${k}_${b}`}>
                                    <td>{b.itemName}</td>
                                    <td>{b.quantity}</td>
                                </tr>
                            )}
                        </table>
                    </ExpandableMaterial> : <></>
            )}
            <button onClick={() => dispatch(refreshMaterialCraftBudgets)}>Refresh</button>
        </ExpandableSection>
    )
}

export default CraftMaterialList
