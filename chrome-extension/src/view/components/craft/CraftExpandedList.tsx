import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { clearCraftingSession, endCraftingSession, setBlueprintExpanded, startBudgetPageLoading, startCraftingSession } from '../../application/actions/craft'
import { getCraft } from '../../application/selectors/craft'
import { BlueprintData, BlueprintMaterial, BlueprintSession, CraftState, STEP_DONE, STEP_ERROR, STEP_INACTIVE, STEP_READY, STEP_REFRESH_TO_END, STEP_REFRESH_TO_START, STEP_SAVING } from '../../application/state/craft'
import { StageText } from '../../services/api/sheets/sheetsStages'

function SessionInfo(p: {
    name: string,
    session: BlueprintSession
}) {
    const dispatch = useDispatch()

    switch (p.session.step) {
        case STEP_INACTIVE:
            return <button onClick={() => dispatch(startCraftingSession(p.name))}>Start</button>
        case STEP_REFRESH_TO_START:
            return <><img className='img-loading' src='img/loading.gif' /> Refreshing items list to start...</>
        case STEP_REFRESH_TO_END:
            return <><img className='img-loading' src='img/loading.gif' /> Refreshing items list to end...</>
        case STEP_ERROR:
            return <>
                <span className='error'>{p.session.errorText}</span>
                <button onClick={() => dispatch(startCraftingSession(p.name))}>Retry</button>
            </>
        case STEP_READY:
            return <>Ready <button onClick={() => dispatch(endCraftingSession(p.name))}>End</button></>
        case STEP_SAVING:
            return <>Saving <img className='img-loading' src='img/loading.gif' /> {StageText[p.session.stage]}...</>
        case STEP_DONE:
            return <button onClick={() => dispatch(clearCraftingSession(p.name))}>Clear</button>
        default:
            return <></>  
    }
}

function CraftSingle(p: {
    d: BlueprintData
    activeSession?: string
}) {
    const { d } = p
    const dispatch = useDispatch()

    function addZeroes(n: number) {
        const dec = n.toString().split('.')[1]
        const len = dec && dec.length > 2 ? dec.length : 2
        return Number(n).toFixed(len)
    }

    let session = undefined
    let sessionProfit = undefined
    if (d.session.step >= STEP_READY) {
        session = {}
        sessionProfit = 0
        d.info.materials.forEach((m: BlueprintMaterial) => {
            const diff = m.available - d.session.startMaterials.find(x => x.n == m.name).q
            session[m.name] = diff
            sessionProfit += diff * m.value
        })
    }

    if (d.expanded) {
        return (
            <>
                <section>
                    <h1>
                        {d.name}
                        <img className='hide' src='img/down.png' onClick={() => dispatch(setBlueprintExpanded(d.name, false))} />
                    </h1>
                    {
                        d.info.loading ?
                            <img className='img-loading' src='img/loading.gif' /> :
                        d.info.materials.length === 0 ?
                            <p>{d.info.errorText}</p> :
                            <div>                                
                                <a href={d.info.url} target='_blank'>entropiawiki</a>
                                <p>Budget Page: {d.budget.loading ?
                                    <><img className='img-loading' src='img/loading.gif' />{StageText[d.budget.stage]}...</> :
                                    <button onClick={() => dispatch(startBudgetPageLoading(d.name))}>{d.budget.hasPage ? 'Refresh' : 'Create'}</button>
                                }</p>
                                <p>Crafting Session: {
                                    p.activeSession !== undefined && d.name !== p.activeSession ? <>{p.activeSession}</> :
                                    <SessionInfo name={d.name} session={d.session} />
                                }</p>
                                <p>Item: {d.itemName}</p>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Needed</th>
                                            <th>Unit Value</th>
                                            <th>Name</th>
                                            <th>Type</th>
                                            <th>Available</th>
                                            <th>Clicks</th>
                                            {
                                                d.budget.clickMUCost === undefined ? <></> :
                                                <>
                                                    <th>Markup</th>
                                                    <th>Budget</th>
                                                </>
                                            }
                                            {
                                                session === undefined ? <></> : <th>Difference</th>
                                            }
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            d.info.materials.map((m: BlueprintMaterial) =>                             
                                                <tr key={m.name}>
                                                    <td align='right'>{m.quantity === 0 ? '-' : m.quantity}</td>
                                                    <td align='right'>{addZeroes(m.value)}</td>
                                                    <td>{m.name}</td>
                                                    <td>{m.type}</td>
                                                    <td align='right'>{m.available}</td>
                                                    <td align='right'>{m.clicks}</td>
                                                    {
                                                        d.budget.clickMUCost === undefined ? <></> :
                                                        <>
                                                            <td align='right'>{(m.markup * 100).toFixed(2)}%</td>
                                                            <td align='right'>{m.budgetCount}</td>
                                                        </>
                                                    }
                                                    {
                                                        session === undefined ? <></> : <td align="right">{session[m.name]}</td>
                                                    }
                                                </tr>)
                                        }
                                    </tbody>
                                </table>
                                {d.inventory === undefined ? <></> :
                                    <>
                                        <p>Clicks available: {d.inventory.clicksAvailable}</p>
                                        <p>Click TT cost: {d.inventory.clickTTCost.toFixed(2)} PED</p>
                                        { d.budget.clickMUCost === undefined ? <></> :
                                            <p>Click MU cost: {d.budget.clickMUCost.toFixed(2)} PED</p> }
                                        { d.inventory.residueNeeded === undefined ? <></> :
                                            <p>Residue needed per click: {d.inventory.residueNeeded.toFixed(2)} PED</p> }
                                        { sessionProfit === undefined ? <></> :
                                            <p>Session profit: {sessionProfit.toFixed(2)} PED</p>}
                                    </>
                                }
                            </div>
                    }
                </section>
            </>
        )
    } else {
        return <></>
    }
}

function CraftExpandedList() {
    const s: CraftState = useSelector(getCraft)

    return (
        <>
            {
                s.blueprints.map((d: BlueprintData) => <CraftSingle key={d.name} d={d} activeSession={s.activeSession} />)
            }
        </>
    )
}

export default CraftExpandedList
