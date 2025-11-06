import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ExpandableSection from '../common/ExpandableSection2'
import { getBudget } from '../../application/selectors/budget'
import { disableBudgetItem, refreshBudget } from '../../application/actions/budget'
import { BudgetItem, BudgetState } from '../../application/state/budget'
import ImgButton from '../common/ImgButton'
import { STAGE_INITIALIZING, StageText } from '../../services/api/sheets/sheetsStages'

function BudgetItemList() {
    const s: BudgetState = useSelector(getBudget)
    const dispatch = useDispatch()

    return (
        <ExpandableSection selector='BudgetItemList' title='List' subtitle='Budget material items'>
            <p>
                <button onClick={() => dispatch(refreshBudget)}>Refresh</button>
                { s.stage === STAGE_INITIALIZING ? '' : <span className="budget-loading">{StageText[s.stage]}... {s.loadPercentage.toFixed(0)}%</span> }
            </p>
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
