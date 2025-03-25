import React, { Dispatch } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BUDGET_BUY, BUDGET_MOVE, BUDGET_SELL, buyBudgetPageMaterial, changeBudgetPageBuyCost, changeBudgetPageBuyFee, clearCraftingSession, endCraftingSession, moveAllBudgetPageMaterial, reloadBlueprint, showBlueprintMaterialData, startBudgetPageLoading, startCraftingSession } from '../../application/actions/craft'
import { auctionFee } from '../../application/helpers/calculator'
import { bpDataFromItemName, itemStringFromName } from '../../application/helpers/craft'
import { getCraft } from '../../application/selectors/craft'
import { getLast } from '../../application/selectors/last'
import { getStatus } from '../../application/selectors/status'
import { BlueprintData, BlueprintSession, CraftState, STEP_DONE, STEP_REFRESH_ERROR, STEP_INACTIVE, STEP_READY, STEP_REFRESH_TO_END, STEP_REFRESH_TO_START, STEP_SAVING, BlueprintMaterial } from '../../application/state/craft'
import { LastRequiredState } from '../../application/state/last'
import { StageText } from '../../services/api/sheets/sheetsStages'
import { SHOW_BUDGET_IN_CRAFT, SHOW_FEATURES_IN_DEVELOPMENT } from '../../../config'
import { MaterialsMap } from '../../application/state/materials'
import { getMaterialsMap } from '../../application/selectors/materials'
import { getByStoreInventory, getByStoreInventoryItem, getInventory } from '../../application/selectors/inventory'
import { InventoryByStore, InventoryState } from '../../application/state/inventory'
import { BlueprintWebMaterial } from '../../../web/state'
import { loadMaterialData, loadMaterialRawMaterials, materialBuyMarkupChanged, materialNotesValueChanged } from '../../application/actions/materials'
import { Field, FieldArea } from '../common/Field'
import WebDataControl from '../common/WebDataControl'
import MaterialInventory from '../material/MaterialInventory'
import { info } from 'sass'
import MaterialNotes from '../material/MaterialNotes'
import MaterialMarkup from '../material/MaterialMarkup'

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

function addZeroes(n: number) {
    const dec = n.toString().split('.')[1]
    const len = dec && dec.length > 2 ? dec.length : 2
    return Number(n).toFixed(len)
}

function CraftSingle(p: {
    d: BlueprintData
    activeSession?: string,
    message?: string
}) {
    const { d } = p
    const dispatch = useDispatch()
    const mat: MaterialsMap = useSelector(getMaterialsMap)

    let markupLoaded = d.budget.sheet?.clickMUCost !== undefined
    let markupMap: {[name: string]: number}
    let budgetMap = undefined
    let clickMUCost: number
    if (markupLoaded) {
        clickMUCost = d.budget.sheet?.clickMUCost;
        Object.entries(d.budget.sheet.materials).forEach(([k, m]) => {
            if (m.markup !== 1) {
                if (markupMap === undefined)
                    markupMap = {}
                markupMap[k] = m.markup
            }
            if (m.count !== 0) {
                if (budgetMap === undefined)
                    budgetMap = {}
                budgetMap[k] = m.count
            }
        })
    } else if (d.c.materials) {
        clickMUCost = 0;
        markupMap = Object.fromEntries(d.c.materials.map((m: BlueprintMaterial) => {
            const strMarkup = mat[m.name]?.buyMarkup;
            const markup = strMarkup ? Number(strMarkup) / 100 : 1;
            clickMUCost += m.quantity * m.value * markup;
            return [m.name, markup];
        }))
        if (Object.values(markupMap).every(n => n === 1)) {
            markupMap = undefined
            clickMUCost = undefined
        }
    }

    let session: {[name: string]: number}
    let sessionTTprofit: number
    let sessionMUprofit: number
    let bought: {[name: string]: {
        quantity: number,
        value: string,
        finalValue: number,
        text: string,
        showFee: boolean,
        withFee?: boolean,
        fee?: string
    }}
    let showMoveAll = false

    if (d.session.diffMaterials !== undefined) {
        session = {}
        sessionTTprofit = 0
        if (markupLoaded)
            sessionMUprofit = 0
        d.web.blueprint.data.value.materials.forEach((m: BlueprintWebMaterial) => {
            const diff = d.session.diffMaterials.find(x => x.n == m.name)
            if (diff !== undefined) {
                session[m.name] = diff.q
                sessionTTprofit += diff.v
                if (markupLoaded) {
                    sessionMUprofit += diff.v * d.budget.sheet.materials[m.name].markup
                }
            }
        })
    } else if (d.budget.hasPage) {
        Object.entries(d.budget.sheet.materials).forEach(([k, m]) => {
            if (budgetMap && budgetMap[k] < 0 && !m.buyDone) {
                if (bought === undefined) {
                    bought = {}
                }
                const quantity = -budgetMap[k]
                const value = d.web?.blueprint?.data?.value.materials[k]?.value ?? 0
                const finalValue = quantity * value * (m.markup ?? 1)
                bought[k] = {
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
            d.c.materials?.forEach((m: BlueprintWebMaterial) => {
                const item = diff.find(x => x.n == m.name && Number(x.q) !== 0)
                const budgetM = d.budget.sheet?.materials[m.name]
                if (item !== undefined && budgetM && !budgetM.buyDone) {
                    if (bought === undefined) {
                        bought = {}
                    }
                    const quantity = Number(item.q)
                    const value = budgetM.buyCost ?? Math.abs(quantity * m.value * (budgetM.markup ?? 1)).toFixed(2)
                    const withFee = quantity < 0 && budgetM.withFee
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
    } else {
        const { diff }: LastRequiredState = useSelector(getLast);
        if (diff) {
            let onNeeded = false
            d.c.materials?.forEach((m: BlueprintWebMaterial) => {
                const sum = diff.filter(x => x.n == m.name && !x.c.includes('⭢'))
                    .reduce((p, c) => ({ v: Number(c.v) + p.v, q: Number(c.q) + p.q }), { v: 0, q: 0 });
                if (sum.v !== 0) {
                    if (!session) {
                        session = {};
                        sessionTTprofit = 0;
                        if (markupMap)
                            sessionMUprofit = 0;
                    }

                    session[m.name] = sum.q;
                    sessionTTprofit += sum.v;
                    sessionMUprofit += sum.v * (markupMap?.[m.name] ?? 1);
                    onNeeded = onNeeded || m.quantity > 0
                }
            })
            if (session && !onNeeded) {
                // mostly by changes on residue
                session = undefined
                sessionTTprofit = undefined
                sessionMUprofit = undefined
            }
        }
    }

    // temporary hide this columns that I don't use
    budgetMap = undefined
    bought = undefined

    return (
        <WebDataControl w={d.web?.blueprint} dispatchReload={() => reloadBlueprint(d.name)} content={bp => <>
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
            <p>Item: {d.c.itemName}</p>
            { d.web?.blueprint && <p>Type: {d.web.blueprint.data.value.type}</p> }
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
                        <th>TT Cost</th>
                        { markupMap && <th>MU Cost</th> }
                    </tr>
                </thead>
                <tbody>
                    {
                        d.c.materials?.map((m: BlueprintMaterial) => {
                            const name = itemStringFromName(d, m.name)
                            return <tr key={m.name} className='item-row stable pointer' onClick={(e) => {
                                e.stopPropagation();
                                dispatch(showBlueprintMaterialData(d.name, d.chain === m.name ? undefined : m.name))
                            }}>
                                <td align='right'>{m.quantity === 0 ? '-' : m.quantity}</td>
                                <td align='right'>{addZeroes(m.value)}</td>
                                <td data-text={name}>
                                    {name}
                                    <img src={d.chain === m.name ? 'img/left.png' : 'img/right.png'}/>
                                </td>
                                <td data-text={m.type}>{m.type}</td>
                                { m.available ? <td data-text-right={m.available}>{m.available}</td> : <td/> }
                                { m.clicks !== undefined ? <td data-text-right={m.clicks}>{m.clicks}</td> : <td/> }
                                { markupMap && <td align='right'>{markupMap[m.name] && markupMap[m.name] !== 1 ? `${(markupMap[m.name] * 100).toFixed(2)}%` : ''}</td> }
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
                                <td align='right'>{m.quantity === 0 ? '' : (m.quantity * m.value).toFixed(2)}</td>
                                { markupMap && <td align='right'>{markupMap[m.name] && m.quantity !== 0 ? (m.quantity * m.value * markupMap[m.name]).toFixed(2) : ''}</td> }
                            </tr>
                        })
                    }
                </tbody>
            </table>
            {
                d.c.inventory &&
                <>
                    <p>Clicks available: {d.c.inventory.clicksAvailable} { d.c.inventory.owned ?
                        `(limited by ${d.c.inventory.limitClickItems.join(', ')})` :
                        <>(not owned) <img style={{height: '17px', marginLeft: '2px'}} title='Not Owned' src='img/warning.png' /></> }
                    </p>
                    <p>Click TT cost: {d.c.inventory.clickTTCost.toFixed(2)} PED</p>
                    { clickMUCost &&
                        <p>Click with MU cost: {clickMUCost.toFixed(2)} PED</p> }
                    { d.c.inventory.residueNeeded > 0 &&
                        <p>Residue needed per click: {d.c.inventory.residueNeeded.toFixed(2)} PED</p> }
                    { sessionTTprofit !== undefined &&
                        <p>Session TT profit: {sessionTTprofit.toFixed(2)} PED</p>}
                    { sessionMUprofit !== undefined &&
                        <p>Session MU profit: {sessionMUprofit.toFixed(2)} PED</p>}
                </>
            }
        </>}/>
    )
}

function CraftExpandedList() {
    const s: CraftState = useSelector(getCraft)
    const mat: MaterialsMap = useSelector(getMaterialsMap)
    const inv: InventoryByStore = useSelector(getByStoreInventory)
    const dispatch = useDispatch()
    const { message } = useSelector(getStatus);
    const d = s.blueprints[s.activePage]
    if (!d) return <></>

    const chainNames: string[] = []
    let afterChain: string = undefined
    let afterBpChain: BlueprintData = undefined
    let lastBpChain: BlueprintData = undefined
    let chain = d.chain
    while (chain) {
        afterBpChain = lastBpChain ?? d
        if (chain == afterBpChain.c.itemName) {
            afterChain = chain
            break
        }

        const nextBp = bpDataFromItemName(s, chain)
        if (nextBp) {
            if (lastBpChain)
                chainNames.push(lastBpChain.name)
            lastBpChain = nextBp
        } else {
            afterChain = chain
        }
        chain = nextBp?.chain
    }
    const afterChainRaw = afterChain && mat[afterChain]?.web?.rawMaterials
    const afterChainBpMat = afterChain && afterBpChain.web?.blueprint?.data?.value.materials.find(m => m.name === afterChain)
    const afterChainMat = afterChain && (mat[afterChain]?.web?.material?.data?.value ?? afterChainBpMat)

    return (
        <section>
            <div className='inline'>
                <h1>{d.name}</h1>
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
                            { afterChainMat && <>
                                <p>Type: { afterChainMat.type }</p>
                                <p>Value: { addZeroes(afterChainMat.value) }</p>
                            </>}
                            <MaterialMarkup name={afterChain} />
                            <WebDataControl w={afterChainRaw}
                                dispatchReload={() => [loadMaterialRawMaterials(afterChain), loadMaterialData(afterChain, afterChainBpMat?.url)]}
                                content={d => d.length > 0 &&
                                <table style={{ marginBottom: '10px' }}>
                                    <thead>
                                        <tr>
                                            <th>Raw Material</th>
                                            <th>Quantity</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        { d.map(rm => (
                                            <tr key={rm.name}>
                                                <td>{rm.name}</td>
                                                <td align='center'>{rm.quantity}</td>
                                            </tr>
                                        )) }
                                    </tbody>
                                </table>
                            }/>
                            <MaterialInventory />
                            <MaterialNotes name={afterChain} />
                        </div>
                    </div>
                }
            </div>
        </section>
    )
}

export default CraftExpandedList
export {
    addZeroes
}
