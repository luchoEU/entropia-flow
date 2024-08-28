import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ExpandableSection from '../common/ExpandableSection'
import { getBudget } from '../../application/selectors/budget'
import { disableBudgetItem, setBudgetListExpanded } from '../../application/actions/budget'
import { BudgetItem, BudgetState } from '../../application/state/budget'

function BudgetItemList() {
    const s: BudgetState = useSelector(getBudget)
    const dispatch = useDispatch()

    return <>
        <ExpandableSection title='List' expanded={s.list.expanded} setExpanded={setBudgetListExpanded}>
            <table className='table-diff'>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>PEDs</th>
                        <th>Total MU</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        s.list.items.map((i: BudgetItem) =>
                            <tr key={i.name}>
                                <td>
                                    <img src='img/cross.png' onClick={(e) => {
                                        e.stopPropagation()
                                        dispatch(disableBudgetItem(i.name))
                                    }} />
                                    {i.name}
                                </td>
                                <td align='right'>{i.peds.toFixed(2)}</td>
                                <td align='right'>{i.totalMU.toFixed(2)}</td>
                                <td align='right'>{i.total.toFixed(2)}</td>
                            </tr>)
                    }
                </tbody>
            </table>
        </ExpandableSection>
    </>
}

export default BudgetItemList
