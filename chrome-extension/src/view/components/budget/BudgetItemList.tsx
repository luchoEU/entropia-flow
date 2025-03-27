import React from 'react'
import { useSelector } from 'react-redux'
import ExpandableSection from '../common/ExpandableSection2'
import { getBudget } from '../../application/selectors/budget'
import { disableBudgetItem } from '../../application/actions/budget'
import { BudgetItem, BudgetState } from '../../application/state/budget'
import ImgButton from '../common/ImgButton'

function BudgetItemList() {
    const s: BudgetState = useSelector(getBudget)

    return (
        <ExpandableSection selector='BudgetItemList' title='List' subtitle='Budget material items'>
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
                                    <ImgButton title='Disable' src='img/cross.png' dispatch={() => disableBudgetItem(i.name)} />
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
    )
}

export default BudgetItemList
