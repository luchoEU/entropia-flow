import React, { Dispatch } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BUDGET_BUY, BUDGET_MOVE, BUDGET_SELL, buyBudgetPageMaterial, changeBudgetPageBuyCost, changeBudgetPageBuyFee, clearCraftingSession, endCraftingSession, moveAllBudgetPageMaterial, reloadBlueprint, setBlueprintActivePage, setBlueprintExpanded, showBlueprintMaterialData, startBudgetPageLoading, startCraftingSession } from '../../application/actions/craft'
import { auctionFee } from '../../application/helpers/calculator'
import { itemName } from '../../application/helpers/craft'
import { getCraft } from '../../application/selectors/craft'
import { getLast } from '../../application/selectors/last'
import { getStatus } from '../../application/selectors/status'
import { BlueprintData, BlueprintMaterial, BlueprintSession, CraftState, STEP_DONE, STEP_REFRESH_ERROR, STEP_INACTIVE, STEP_READY, STEP_REFRESH_TO_END, STEP_REFRESH_TO_START, STEP_SAVING } from '../../application/state/craft'
import { LastRequiredState } from '../../application/state/last'
import { StageText } from '../../services/api/sheets/sheetsStages'
import { SHOW_BUDGET_IN_CRAFT, SHOW_FEATURES_IN_DEVELOPMENT } from '../../../config'
import ImgButton from '../common/ImgButton'

function SessionInfo(p: {
    name: string,
    session: BlueprintSession,
    dispatch: Dispatch<any>,
    message: string,
    showMoveAll: boolean
}) {
    const { dispatch, message, showMoveAll } = p
    switch (p.session.step) {
        case STEP_INACTIVE:
            return <>
                <button onClick={() => dispatch(startCraftingSession(p.name))}>Start</button>
                { showMoveAll && false ? <button onClick={() => dispatch(moveAllBudgetPageMaterial(p.name))}>Move All</button> : <></> }
            </>
        case STEP_REFRESH_TO_START:
            return <><img className='img-loading' src='img/loading.gif' /> Refreshing items list to start...</>
        case STEP_REFRESH_TO_END:
            return <><img className='img-loading' src='img/loading.gif' /> Refreshing items list to end...</>
        case STEP_REFRESH_ERROR:
            return <>
                <span className='error'>{p.session.errorText}</span>
                <button className="wait-button" onClick={() => dispatch(clearCraftingSession(p.name))}>Clear</button>
                <button className='wait-button' onClick={() => dispatch(startCraftingSession(p.name))}>Retry</button>
                <span>{message}</span>
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
    activeSession?: string,
    message?: string
}) {
    const { d } = p
    const dispatch = useDispatch()

    function addZeroes(n: number) {
        const dec = n.toString().split('.')[1]
        const len = dec && dec.length > 2 ? dec.length : 2
        return Number(n).toFixed(len)
    }

    let markupLoaded = d.budget.clickMUCost !== undefined
    let markupMap = undefined
    let budgetMap = undefined
    if (markupLoaded) {
        d.info.materials.forEach((m: BlueprintMaterial) => {
            if (m.markup !== 1) {
                if (markupMap === undefined)
                    markupMap = {}
                markupMap[m.name] = `${(m.markup * 100).toFixed(2)}%`
            }
            if (m.budgetCount !== 0) {
                if (budgetMap === undefined)
                    budgetMap = {}
                budgetMap[m.name] = m.budgetCount
            }
        })
    }

    let session = undefined
    let sessionTTprofit = undefined
    let sessionMUprofit = undefined
    let bought: {[name: string]: {
        quantity: number,
        value: string,
        finalValue: number,
        text: string,
        showFee: boolean,
        withFee?: boolean,
        fee?: string
    }} = undefined
    let showMoveAll = false

    if (d.session.diffMaterials !== undefined) {
        session = {}
        sessionTTprofit = 0
        if (markupLoaded)
            sessionMUprofit = 0
        d.info.materials.forEach((m: BlueprintMaterial) => {
            const name = itemName(d, m)
            const diff = d.session.diffMaterials.find(x => x.n == name)
            if (diff !== undefined) {
                session[m.name] = diff.q
                sessionTTprofit += diff.v
                if (markupLoaded)
                    sessionMUprofit += diff.v * m.markup
            }
        })
    } else if (d.budget.hasPage) {
        d.info.materials.forEach((m: BlueprintMaterial) => {
            if (budgetMap && budgetMap[m.name] < 0 && !m.buyDone) {
                if (bought === undefined) {
                    bought = {}
                }
                const quantity = -budgetMap[m.name]
                const finalValue = quantity * m.value * (m.markup ?? 1)
                bought[m.name] = {
                    quantity,
                    value: finalValue.toFixed(2),
                    finalValue, 
                    text: BUDGET_MOVE,
                    showFee: false,
                }
                showMoveAll = true
            }
        })

        const { diff }: LastRequiredState = useSelector(getLast)
        if (diff) {
            d.info.materials.forEach((m: BlueprintMaterial) => {
                const name = itemName(d, m)
                const item = diff.find(x => x.n == name && Number(x.q) !== 0)
                if (item !== undefined && !m.buyDone) {
                    if (bought === undefined) {
                        bought = {}
                    }
                    const quantity = Number(item.q)
                    const value = m.buyCost ?? Math.abs(quantity * m.value * (m.markup ?? 1)).toFixed(2)
                    const withFee = quantity < 0 && m.withFee
                    const fee = withFee ? auctionFee(Number(value) + quantity * m.value).toFixed(2) : undefined // + quantity becuase is < 0
                    const finalValue = withFee ? Number(value) - Number(fee) : Number(value)
                    bought[m.name] = {
                        quantity,
                        value,
                        finalValue,
                        text: quantity > 0 ? BUDGET_BUY : BUDGET_SELL,
                        showFee: quantity < 0,
                        withFee,
                        fee
                    }
                }
            })
        }
    }

    // temporary hide this columns that I don't use
    budgetMap = undefined
    bought = undefined

    return (d.info.loading ?
        <><img className='img-loading' src='img/loading.gif' /> Loading from entropiawiki.com</> :
        <div>
            { d.info.url ? <a href={d.info.url} target='_blank'>entropiawiki</a> : <></> }
            { d.info.materials.length === 0 ?
                <p>{d.info.errorText} <ImgButton
                    title='Try to load blueprint again'
                    src='img/reload.png'
                    className='img-delta-zero'
                    dispatch={() => reloadBlueprint(d.name)} /></p> :
                <>
                { SHOW_FEATURES_IN_DEVELOPMENT && SHOW_BUDGET_IN_CRAFT && <>
                    <p>Budget Page: { d.budget.loading ?
                    <><img className='img-loading' src='img/loading.gif' />{StageText[d.budget.stage]}...</> :
                    <button onClick={(e) => {
                        e.stopPropagation();
                        dispatch(startBudgetPageLoading(d.name))
                    }}>{d.budget.hasPage ? 'Refresh' : 'Create'}</button>
                    }</p>
                    <p>Crafting Session: {
                        p.activeSession !== undefined && d.name !== p.activeSession ? <>{p.activeSession}</> :
                        <SessionInfo name={d.name} session={d.session} dispatch={dispatch} message={p.message} showMoveAll={showMoveAll} />
                    }</p>
                </> }
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
                            { markupMap && <th>Markup</th> }
                            { budgetMap && <th>Budget</th> }
                            { session && <th>Difference</th> }
                            { bought && <th>Bought</th> }
                        </tr>
                    </thead>
                    <tbody>
                        {
                            d.info.materials.map((m: BlueprintMaterial) =>
                                <tr key={m.name} className='item-row stable pointer' onClick={(e) => {
                                    e.stopPropagation();
                                    dispatch(showBlueprintMaterialData(d.name, d.chain === m.name ? undefined : m.name))
                                }}>
                                    <td align='right'>{m.quantity === 0 ? '-' : m.quantity}</td>
                                    <td align='right'>{addZeroes(m.value)}</td>
                                    <td data-text={m.name}>
                                        {m.name}
                                        <img src={d.chain === m.name ? 'img/left.png' : 'img/right.png'}/>
                                    </td>
                                    <td data-text={m.type}>{m.type}</td>
                                    <td data-text-right={m.available}>{m.available}</td>
                                    <td data-text-right={m.clicks}>{m.clicks}</td>
                                    { markupMap && <td align='right'>{markupMap[m.name]}</td> }
                                    { budgetMap && <td align='right'>{budgetMap[m.name]}</td> }
                                    { session && <td align="right">{session[m.name]}</td> }
                                    {
                                        bought !== undefined && bought[m.name] &&
                                            <td>
                                            { d.budget.loading ?
                                                <img className='img-loading' src='img/loading.gif' /> :
                                                <>
                                                    <input
                                                        type='text'
                                                        value={bought[m.name].value}
                                                        className='input-budget-buy'
                                                        onChange={(e) => dispatch(changeBudgetPageBuyCost(d.name, m.name, e.target.value))}
                                                    /> PED
                                                    <button
                                                        onClick={() => dispatch(buyBudgetPageMaterial(d.name, m.name, bought[m.name].text, bought[m.name].finalValue, bought[m.name].quantity))}>
                                                        {`${bought[m.name].text} ${Math.abs(bought[m.name].quantity)}`}</button>
                                                    { bought[m.name].showFee && <>
                                                        <input
                                                            id='withFeeCheck'
                                                            type='checkbox'
                                                            checked={bought[m.name].withFee}
                                                            onChange={(e) => dispatch(changeBudgetPageBuyFee(d.name, m.name, e.target.checked))} />
                                                        <label htmlFor="withFeeCheck">Fee</label>
                                                            &nbsp;{bought[m.name].fee}
                                                    </> }
                                                </>}
                                            </td>
                                    }
                                </tr>)
                        }
                    </tbody>
                </table>
                {
                    d.inventory &&
                    <>
                        <p>Clicks available: {d.inventory.clicksAvailable}</p>
                        <p>Click TT cost: {d.inventory.clickTTCost.toFixed(2)} PED</p>
                        { d.budget.clickMUCost === undefined ? <></> :
                            <p>Click MU cost: {d.budget.clickMUCost.toFixed(2)} PED</p> }
                        { d.inventory.residueNeeded === undefined ? <></> :
                            <p>Residue needed per click: {d.inventory.residueNeeded.toFixed(2)} PED</p> }
                        { sessionTTprofit === undefined ? <></> :
                            <p>Session TT profit: {sessionTTprofit.toFixed(2)} PED</p>}
                        { sessionMUprofit === undefined ? <></> :
                            <p>Session MU profit: {sessionMUprofit.toFixed(2)} PED</p>}
                    </>
                }
                </>
            }
        </div>
    )
}

function CraftExpandedList() {
    const s: CraftState = useSelector(getCraft)
    const dispatch = useDispatch()
    const { message } = useSelector(getStatus);
    const d = s.blueprints.find(b => b.name === s.activePage)
    if (!d) return <></>

    const chainNames: string[] = []
    let afterChain: string = undefined
    let afterBpChain: BlueprintData = undefined
    let lastBpChain: BlueprintData = undefined
    let chain = d.chain
    while (chain) {
        const nextBp = s.blueprints.find(b => b.itemName === chain)
        if (nextBp) {
            if (lastBpChain)
                chainNames.push(lastBpChain.name)
            lastBpChain = nextBp
        } else {
            afterChain = chain
            afterBpChain = lastBpChain ?? d
        }
        chain = nextBp?.chain
    }

    return (
        <section>
            <div className='inline'>
                <h1 onClick={(e) => { e.stopPropagation(); dispatch(setBlueprintExpanded(d.name)(false)) }}>
                    {d.name}
                    <img className='hide' src='img/down.png' />
                </h1>
                <CraftSingle key={d.name} d={d} activeSession={s.activeSession} message={message} />
            </div>
            <div className='inline'>
                { chainNames.map(name =>
                    <div className='craft-chain'>
                        <h2 className='pointer img-hover' onClick={(e) => {
                                e.stopPropagation();
                                dispatch(showBlueprintMaterialData(name, undefined))
                            }}>
                            { name }<img src='img/right.png' />
                        </h2>
                    </div>
                )}
                { lastBpChain &&
                    <div className='craft-chain'>
                        <h2 className='pointer img-hover' onClick={(e) => {
                                e.stopPropagation();
                                dispatch(showBlueprintMaterialData(chainNames.length > 0 ? chainNames[chainNames.length - 1] : d.name, undefined))
                            }}>
                            { lastBpChain.name }<img src='img/left.png' />
                        </h2>
                        <CraftSingle key={d.chain} d={lastBpChain} />
                    </div>
                }
                { afterChain &&
                    <div className='craft-chain'>
                        <h2 className='pointer img-hover' onClick={(e) => { e.stopPropagation(); dispatch(showBlueprintMaterialData(afterBpChain.name, undefined)) }}>
                            { afterChain }<img src='img/left.png' />
                        </h2>
                        <div>
                            <p>Type: {afterBpChain.info.materials.find(m => m.name === afterChain).type}</p>
                        </div>
                    </div>
                }
            </div>
        </section>
    )
}

export default CraftExpandedList
