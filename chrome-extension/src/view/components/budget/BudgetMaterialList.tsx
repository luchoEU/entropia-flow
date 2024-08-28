import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ExpandableSection from '../common/ExpandableSection'
import { getBudget } from '../../application/selectors/budget'
import { BudgetMaterialsMap, BudgetState } from '../../application/state/budget'
import { setBudgetMaterialExpanded, setBudgetMaterialListExpanded } from '../../application/actions/budget'

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

function BudgetMaterialList() {
    const s: BudgetState = useSelector(getBudget)
    const m: BudgetMaterialsMap = s.materials.map

    return (
        <ExpandableSection title='Budget Materials' expanded={s.materials.expanded} setExpanded={setBudgetMaterialListExpanded}>
            { Object.keys(m).sort().map(k => 
                m[k].total > 0 ?
                    <ExpandableMaterial key={k} quantity={m[k].total} name={k} expanded={m[k].expanded} setExpanded={setBudgetMaterialExpanded(k)}>
                        <table>
                            { m[k].list.sort((a, b) => a.itemName.localeCompare(b.itemName)).map(b =>
                                <tr key={`${k}_${b}`}>
                                    <td>{b.itemName}</td>
                                    <td>{b.quantity}</td>
                                </tr>
                            )}
                        </table>
                    </ExpandableMaterial> : <></>
            )}
        </ExpandableSection>
    )
}

export default BudgetMaterialList
