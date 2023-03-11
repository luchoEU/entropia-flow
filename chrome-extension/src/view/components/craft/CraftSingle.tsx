import React from 'react'
import { useDispatch } from 'react-redux'
import { endCraftingSession, removeBlueprint, startBudgetPageLoading, startCraftingSession } from '../../application/actions/craft'
import { BlueprintData, BlueprintMaterial, BlueprintSession, STEP_ERROR, STEP_INACTIVE, STEP_READY, STEP_REFRESH_TO_END, STEP_REFRESH_TO_START, STEP_SAVING } from '../../application/state/craft'
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
                <span className='error'>p.session.errorText</span>
                <button onClick={() => dispatch(startCraftingSession(p.name))}>Retry</button>
            </>
        case STEP_READY:
            return <>Ready <button onClick={() => dispatch(endCraftingSession(p.name))}>End</button></>
        case STEP_SAVING:
            return <>Saving <img className='img-loading' src='img/loading.gif' /> {StageText[p.session.stage]}...</>
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

    return (
        <>
            <section>
                <h1>{d.name} <img src='img/cross.png' onClick={() => dispatch(removeBlueprint(d.name))} /></h1>
                {
                    d.info.loading ?
                        <img className='img-loading' src='img/loading.gif' /> :
                    d.info.materials.length === 0 ?
                        <p>{d.info.errorText}</p> :
                        <div>                                
                            <a href={d.info.url} target='_blank'>entropiawiki</a>
                            <p>{d.budget.loading ?
                                <>Loading Budget Page: <img className='img-loading' src='img/loading.gif' />{StageText[d.budget.stage]}...</> :
                                <button onClick={() => dispatch(startBudgetPageLoading(d.name))}>Load Budget Page</button>
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
                                            d.name !== p.activeSession || d.session.step !== STEP_READY ? <></> :
                                            <th>Difference</th>
                                        }
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        d.info.materials.map((m: BlueprintMaterial) =>                                
                                            <tr key={m.name}>
                                                <td align='right'>{m.quantity}</td>
                                                <td align='right'>{m.value}</td>
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
                                                    d.name !== p.activeSession || d.session.step !== STEP_READY ? <></> :
                                                    <td align='right'>{m.quantity - d.session.startMaterials.find(x => x.n == m.name).q}</td>
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
                                    <p>Residue needed per click: {d.inventory.residueNeeded.toFixed(2)} PED</p>
                                    { d.budget.total === undefined ? <></> :
                                        <p>Total Budget: {d.budget.total.toFixed(2)} PED</p> }
                                    { d.budget.peds === undefined ? <></> :
                                        <p>PEDs available: {d.budget.peds.toFixed(2)} PED</p> }
                                </>
                            }
                        </div>
                }
            </section>
        </>
    )
}

export default CraftSingle
