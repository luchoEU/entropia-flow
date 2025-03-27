import React from 'react'
import { useSelector } from 'react-redux'
import ExpandableSection from '../common/ExpandableSection2'
import { getBudget } from '../../application/selectors/budget'
import { enableBudgetItem } from '../../application/actions/budget'
import { BudgetState } from '../../application/state/budget'
import ImgButton from '../common/ImgButton'

function BudgetDisabledList() {
    const s: BudgetState = useSelector(getBudget)

    return (
        <ExpandableSection selector='BudgetDisabledList' title='Disabled' subtitle='Budget material disable items'>
            <table className='table-diff'>
                <thead>
                    <tr>
                        <th>Name</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        s.disabledItems.names.map((name: string) =>
                            <tr key={name}>
                                <td>
                                    <ImgButton title='Enable' src='img/tick.png' dispatch={() => enableBudgetItem(name)} />
                                    {name}
                                </td>
                            </tr>)
                    }
                </tbody>
            </table>
        </ExpandableSection>
    )
}

export default BudgetDisabledList
