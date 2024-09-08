import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ExpandableSection from '../common/ExpandableSection'
import { getBudget } from '../../application/selectors/budget'
import { BudgetMaterialsMap, BudgetMaterialState, BudgetState } from '../../application/state/budget'
import { addBudgetMaterialSelection, disableBudgetMaterial, enableBudgetMaterial, processBudgetMaterialSelection, removeBudgetMaterialSelection, setBudgetMaterialExpanded, setBudgetMaterialListExpanded } from '../../application/actions/budget'

const ExpandableMaterial = (p: {
    name: string,
    material: BudgetMaterialState,
    setExpanded: (expanded: boolean) => any,
    children: any
}) => {
    const dispatch = useDispatch()

    return (
        <div className='craft-material'>
            <h3>
                <div>{p.material.totalListQuantity}</div>
                <div>{p.material.selected ? <strong>{p.name}</strong> : p.name}</div>
                {Math.abs(p.material.quantityBalance * p.material.unitValue* p.material.markup) > 20 ?
                    (p.material.selected ?
                        <button onClick={() => dispatch(removeBudgetMaterialSelection(p.name))}>!! selected</button> :
                        <button onClick={() => dispatch(addBudgetMaterialSelection(p.name))}>!!</button>) :
                    <></>
                }
                {p.material.expanded ?
                    <img className='hide' src='img/up.png' onClick={() => dispatch(p.setExpanded(false))} /> :
                    <img src='img/down.png' onClick={() => dispatch(p.setExpanded(true))} />}
            </h3>
            {
                p.material.expanded ? p.children : ''
            }
        </div>
    )
}

function BudgetMaterialList() {
    const s: BudgetState = useSelector(getBudget)
    const m: BudgetMaterialsMap = s.materials.map
    const dispatch = useDispatch()

    return (
        <ExpandableSection title='Budget Materials' expanded={s.materials.expanded} setExpanded={setBudgetMaterialListExpanded}>
            { Object.keys(m).sort().map(k => 
                m[k].totalListQuantity > 0 ?
                    <ExpandableMaterial key={k} name={k} material={m[k]} setExpanded={setBudgetMaterialExpanded(k)}>
                        <table className='table-diff'>
                            { m[k].budgetList.sort((a, b) => a.itemName.localeCompare(b.itemName)).map(b =>
                                <tr key={`${k}_${b}`}>
                                    <td>{b.itemName}</td>
                                    <td align='right'>{b.quantity}</td>
                                    <td align='right'>{(b.quantity * m[k].unitValue).toFixed(2)} PED</td>
                                </tr>
                            )}
                            { m[k].realList.sort((a, b) => a.itemName.localeCompare(b.itemName)).map(b =>
                                <tr key={`${k}_${b}`}>
                                    <td>{b.disabled ?
                                            <img src='img/tick.png' onClick={(e) => {
                                                e.stopPropagation()
                                                dispatch(enableBudgetMaterial(k, b.itemName))
                                            }} /> :
                                            <img src='img/cross.png' onClick={(e) => {
                                                e.stopPropagation()
                                                dispatch(disableBudgetMaterial(k, b.itemName))
                                            }} />
                                        }
                                        {b.itemName}
                                    </td>
                                    <td align='right'>{b.disabled ? `(${b.quantity})` : b.quantity}</td>
                                    <td align='right'>{b.disabled ? '' : (b.quantity * m[k].unitValue).toFixed(2) + ' PED'}</td>
                                </tr>
                            )}

                            <tr key='total'>
                                <td>TOTAL</td>
                                <td align='right'>{m[k].quantityBalance}</td>
                                <td align='right'>{(m[k].totalListQuantity * m[k].unitValue).toFixed(2)} PED</td>
                            </tr>

                            <tr key='markup'>
                                <td>Markup</td>
                                <td align='right'>{(m[k].markup * 100).toFixed(2)}%</td>
                                <td align='right'>{(m[k].quantityBalance * m[k].unitValue* m[k].markup).toFixed(2)} PED</td>
                            </tr>
                        </table>
                    </ExpandableMaterial> : <></>
            )}
            <div>
                Selected: {s.materials.selectedCount}
                {s.materials.selectedCount > 0 ? <button onClick={() => dispatch(processBudgetMaterialSelection())}>Adjust</button> : ''}
            </div>
        </ExpandableSection>
    )
}

export default BudgetMaterialList
