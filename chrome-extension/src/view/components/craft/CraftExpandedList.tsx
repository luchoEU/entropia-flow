import React, { Dispatch } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BUDGET_BUY, BUDGET_MOVE, BUDGET_SELL, buyBudgetPageMaterial, changeBudgetPageBuyCost, changeBudgetPageBuyFee, clearCraftingSession, endCraftingSession, moveAllBudgetPageMaterial, reloadBlueprint, showBlueprintMaterialData, startBudgetPageLoading, startCraftingSession } from '../../application/actions/craft'
import { auctionFee } from '../../application/helpers/calculator'
import { bpDataFromItemName, itemNameFromString } from '../../application/helpers/craft'
import { getCraft } from '../../application/selectors/craft'
import { getLast } from '../../application/selectors/last'
import { getStatus } from '../../application/selectors/status'
import { BlueprintData, BlueprintSession, CraftState, STEP_DONE, STEP_REFRESH_ERROR, STEP_INACTIVE, STEP_READY, STEP_REFRESH_TO_END, STEP_REFRESH_TO_START, STEP_SAVING, BlueprintBudgetMaterial } from '../../application/state/craft'
import { LastRequiredState } from '../../application/state/last'
import { StageText } from '../../services/api/sheets/sheetsStages'
import { SHOW_BUDGET_IN_CRAFT, SHOW_FEATURES_IN_DEVELOPMENT } from '../../../config'
import ImgButton from '../common/ImgButton'
import { setByStoreCraftItemExpanded, sortByStoreCraftBy } from '../../application/actions/inventory'
import { MaterialsMap } from '../../application/state/materials'
import { getMaterialsMap } from '../../application/selectors/materials'
import { SortableFixedSizeTable, TableData } from '../common/SortableTableSection'
import { getByStoreInventory, getByStoreInventoryCraftItem } from '../../application/selectors/inventory'
import { InventoryByStore, TreeLineData } from '../../application/state/inventory'
import { NAME, QUANTITY, sortColumnDefinition, VALUE } from '../../application/helpers/inventory.sort'
import { BlueprintWebMaterial } from '../../../web/state'
import { WebLoadResponse } from '../../../web/loader'
import { loadMaterialRawMaterials } from '../../application/actions/materials'

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

function WebDataControl<T>(p: {
    w: WebLoadResponse<T>,
    dispatchReload: () => any,
    content: (data: T) => JSX.Element
}) {
    const { w } = p
    const reload = () => p.dispatchReload && <ImgButton
        title='Try to load blueprint again'
        src='img/reload.png'
        className='img-delta-zero'
        dispatch={p.dispatchReload} />
    return <>
        { !w ? reload() : (
            w.loading ?
                <p><img data-show className='img-loading' src='img/loading.gif' /> Loading from {w.loading.source}...</p> :
            (w.errors ?
                <>
                    { w.errors.map((e, index) =>
                        <p key={index}>
                            {e.message} { e.href && <a href={e.href} target='_blank'>link</a> }
                        </p>) }
                    { reload() }
                </> :
                <>
                    <p>{ w.data.link && <a href={w.data.link.href} target='_blank'>{w.data.link.text}</a> }{ reload() }</p>
                    { p.content(w.data.value) }
                </>)
        )}
    </>
}

function CraftSingle(p: {
    d: BlueprintData
    activeSession?: string,
    message?: string
}) {
    const { d } = p
    const dispatch = useDispatch()
    const mat: MaterialsMap = useSelector(getMaterialsMap)

    function addZeroes(n: number) {
        const dec = n.toString().split('.')[1]
        const len = dec && dec.length > 2 ? dec.length : 2
        return Number(n).toFixed(len)
    }

    let markupLoaded = d.budget.sheet?.clickMUCost !== undefined
    let markupMap = undefined
    let budgetMap = undefined
    if (markupLoaded) {
        Object.entries(d.budget.sheet.materials).forEach(([k, m]) => {
            if (m.markup !== 1) {
                if (markupMap === undefined)
                    markupMap = {}
                markupMap[k] = `${(m.markup * 100).toFixed(2)}%`
            }
            if (m.count !== 0) {
                if (budgetMap === undefined)
                    budgetMap = {}
                budgetMap[k] = m.count
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
        d.web.blueprint.data.value.materials.forEach((m: BlueprintWebMaterial) => {
            const name = itemNameFromString(d, m.name)
            const diff = d.session.diffMaterials.find(x => x.n == name)
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
                const value = d.web.blueprint.data.value.materials[k].value
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
            d.web.blueprint.data.value.materials.forEach((m: BlueprintWebMaterial) => {
                const name = itemNameFromString(d, m.name)
                const item = diff.find(x => x.n == name && Number(x.q) !== 0)
                const budgetM = d.budget.sheet?.materials[m.name]
                if (item !== undefined && !budgetM.buyDone) {
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
                        bp.materials.map((m: BlueprintWebMaterial) => {
                            const invM = d.c.inventory?.materials[m.name]
                            const type = mat[m.name]?.web?.material?.data?.value.type ?? m.type
                            return <tr key={m.name} className='item-row stable pointer' onClick={(e) => {
                                e.stopPropagation();
                                dispatch(showBlueprintMaterialData(d.name, d.chain === m.name ? undefined : m.name))
                            }}>
                                <td align='right'>{m.quantity === 0 ? '-' : m.quantity}</td>
                                <td align='right'>{addZeroes(m.value)}</td>
                                <td data-text={m.name}>
                                    {m.name}
                                    <img src={d.chain === m.name ? 'img/left.png' : 'img/right.png'}/>
                                </td>
                                <td data-text={type}>{type}</td>
                                { invM ? <td data-text-right={invM.available}>{invM.available}</td> : <td/> }
                                { invM ? <td data-text-right={invM.clicks}>{invM.clicks}</td> : <td/> }
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
                            </tr>
                        })
                    }
                </tbody>
            </table>
            {
                d.c.inventory &&
                <>
                    <p>Clicks available: {d.c.inventory.clicksAvailable}</p>
                    <p>Click TT cost: {d.c.inventory.clickTTCost.toFixed(2)} PED</p>
                    { d.budget.sheet?.clickMUCost &&
                        <p>Click MU cost: {d.budget.sheet.clickMUCost.toFixed(2)} PED</p> }
                    { d.c.inventory.residueNeeded > 0 &&
                        <p>Residue needed per click: {d.c.inventory.residueNeeded.toFixed(2)} PED</p> }
                    { sessionTTprofit &&
                        <p>Session TT profit: {sessionTTprofit.toFixed(2)} PED</p>}
                    { sessionMUprofit &&
                        <p>Session MU profit: {sessionMUprofit.toFixed(2)} PED</p>}
                </>
            }
        </>}/>
    )
}

const INDENT_SPACE = 10
const tableData: TableData<TreeLineData> = {
    columns: [NAME, QUANTITY, VALUE],
    definition: sortColumnDefinition,
    sortRow: {
        [NAME]: { justifyContent: 'center', text: 'Name in Inventory' },
        [QUANTITY]: { justifyContent: 'end' },
        [VALUE]: { justifyContent: 'end' },
    },
    getRow: (item: TreeLineData) => ({
        dispatch: item.expanded !== undefined ? () => setByStoreCraftItemExpanded(item.id)(!item.expanded) : undefined,
        columns: {
            [NAME]: {
                style: { paddingLeft: item.indent * INDENT_SPACE },
                sub: [
                    { plusButton: { expanded: item.expanded, setExpanded: setByStoreCraftItemExpanded(item.id) } },
                    { itemText: item.n }
                ]
            },
            [QUANTITY]: {
                style: { justifyContent: 'center' },
                sub: [{ itemText: item.q }]
            },
            [VALUE]: {
                style: { justifyContent: 'center' },
                sub: [{ itemText: item.v }]
            }
        }
    })
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
        const nextBp = bpDataFromItemName(s, chain)
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
    const afterChainRaw = afterChain && mat[afterChain]?.web?.rawMaterials
    const afterChainName = afterChain && itemNameFromString(afterBpChain, afterChain)

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
                            { afterChainName }<img src='img/left.png' />
                        </h2>
                        <div>
                            <p>
                                Type: {
                                    mat[afterChainName]?.web?.material?.data?.value.type ??
                                    afterBpChain.web?.blueprint.data.value.materials.find(m => m.name === afterChain).type
                                }
                            </p>
                            <WebDataControl w={afterChainRaw} dispatchReload={() => loadMaterialRawMaterials(afterChainName)} content={d => d.length > 0 &&
                                <p>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Raw Material</th>
                                                <th>Quantity</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            { d.map(rm => (
                                                <tr>
                                                    <td>{rm.name}</td>
                                                    <td align='center'>{rm.quantity}</td>
                                                </tr>
                                            )) }
                                        </tbody>
                                    </table>
                                </p>
                            }/>
                            { inv.flat.craft.length === 0 ?
                                <p><strong>None on Inventory</strong></p> :
                                <SortableFixedSizeTable
                                    data={{
                                        allItems: inv.flat.craft,
                                        showItems: inv.flat.craft,
                                        sortType: inv.craft.list.sortType,
                                        sortBy: sortByStoreCraftBy,
                                        itemSelector: getByStoreInventoryCraftItem,
                                        tableData
                                    }}
                                />
                            }
                        </div>
                    </div>
                }
            </div>
        </section>
    )
}

export default CraftExpandedList
