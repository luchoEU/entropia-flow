import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { STAGE_INITIALIZING, STAGE_LOADING_SPREADSHEET, StageText } from '../../services/api/sheets/sheetsStages'
import { getBudget } from '../../application/selectors/budget'
import { BudgetState } from '../../application/state/budget'
import { refreshBudget } from '../../application/actions/budget'

function BudgetControl() {
    const s: BudgetState = useSelector(getBudget)
    const dispatch = useDispatch()

    return (
        <section>
            { s.stage === STAGE_INITIALIZING ? '' : <p>{StageText[s.stage]}... {s.loadPercentage.toFixed(0)}%</p> }
            <button onClick={() => dispatch(refreshBudget)}>Refresh</button>
        </section>
    )
}

export default BudgetControl
