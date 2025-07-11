import React, { Dispatch, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addBlueprint, addBlueprintMaterial, BUDGET_BUY, BUDGET_MOVE, BUDGET_SELL, buyBudgetPageMaterial, changeBlueprintMaterialName, changeBlueprintMaterialQuantity, changeBudgetPageBuyCost, changeBudgetPageBuyFee, clearCraftingSession, endCraftingSession, moveAllBudgetPageMaterial, moveBlueprintMaterial, reloadBlueprint, removeBlueprintMaterial, startBlueprintEditMode, showBlueprintMaterialData, startBudgetPageLoading, startCraftingSession, endBlueprintEditMode } from '../../application/actions/craft'
import { auctionFee } from '../../application/helpers/calculator'
import { bpDataFromItemName, itemStringFromName } from '../../application/helpers/craft'
import { getCraft } from '../../application/selectors/craft'
import { getLast } from '../../application/selectors/last'
import { getStatus } from '../../application/selectors/status'
import { BlueprintData, BlueprintSession, CraftState, STEP_DONE, STEP_REFRESH_ERROR, STEP_INACTIVE, STEP_READY, STEP_REFRESH_TO_END, STEP_REFRESH_TO_START, STEP_SAVING, BlueprintMaterial } from '../../application/state/craft'
import { LastRequiredState } from '../../application/state/last'
import { StageText } from '../../services/api/sheets/sheetsStages'
import { ItemsMap, ItemsState } from '../../application/state/items'
import { getItems, getItemsMap } from '../../application/selectors/items'
import { BlueprintWebMaterial, RawMaterialWebData } from '../../../web/state'
import { changeMaterialType, changeMaterialValue, endMaterialEditMode, loadItemData, loadItemRawMaterials, startMaterialEditMode } from '../../application/actions/items'
import WebDataControl from '../common/WebDataControl'
import ItemInventory from '../item/ItemInventory'
import ItemNotes from '../item/ItemNotes'
import ItemMarkup from '../item/ItemMarkup'
import { WebLoadResponse } from '../../../web/loader'
import { filterExact, filterOr } from '../../../common/filter'
import { StarButton } from './CraftBlueprintList'
import CraftPlanet from './CraftPlanet'
import ImgButton from '../common/ImgButton'
import { TabId } from '../../application/state/navigation'
import { navigateToTab } from '../../application/actions/navigation'
import { NavigateFunction } from 'react-router-dom'
import { Feature } from '../../application/state/settings'
import { selectIsFeatureEnabled } from '../../application/selectors/settings'
import { useElementSize } from '../common/useElementSize'
import AutocompleteInput from '../common/AutocompleteInput'

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

const CraftSingle = ({ bp, activeSession, message }: {
    bp: BlueprintData
    activeSession?: string,
    message?: string
}) => {
    const dispatch = useDispatch()
    const mat: ItemsMap = useSelector(getItemsMap)
    const showBudget = useSelector(selectIsFeatureEnabled(Feature.budget));
    const { ref: tableRef, size: { width: tableWidth } } = useElementSize<HTMLTableElement>();

    let markupLoaded = bp.budget.sheet?.clickMUCost !== undefined
    let markupMap: {[name: string]: number}
    let budgetMap = undefined
    let clickMUCost: number
    if (markupLoaded) {
        clickMUCost = bp.budget.sheet?.clickMUCost;
        Object.entries(bp.budget.sheet.materials).forEach(([k, m]) => {
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
    } else if (bp.c?.materials) {
        clickMUCost = 0;
        markupMap = Object.fromEntries(bp.c.materials.map((m: BlueprintMaterial) => {
            const nMarkup = Number(mat[m.name]?.markup?.value);
            const markup = isNaN(nMarkup) ? 1 : nMarkup / 100;
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

    if (bp.session.diffMaterials !== undefined) {
        session = {}
        sessionTTprofit = 0
        if (markupLoaded)
            sessionMUprofit = 0
        bp.web?.blueprint.data.value.materials.forEach((m: BlueprintWebMaterial) => {
            const diff = bp.session.diffMaterials.find(x => x.n == m.name)
            if (diff !== undefined) {
                session[m.name] = diff.q
                sessionTTprofit += diff.v
                if (markupLoaded) {
                    sessionMUprofit += diff.v * bp.budget.sheet.materials[m.name].markup
                }
            }
        })
    } else if (bp.budget.hasPage) {
        Object.entries(bp.budget.sheet.materials).forEach(([k, m]) => {
            if (budgetMap && budgetMap[k] < 0 && !m.buyDone) {
                if (bought === undefined) {
                    bought = {}
                }
                const quantity = -budgetMap[k]
                const value = bp.web?.blueprint?.data?.value.materials[k]?.value ?? 0
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

        const { c: { diff } }: LastRequiredState = useSelector(getLast)
        if (diff) {
            bp.c.materials?.forEach((m: BlueprintWebMaterial) => {
                const item = diff.find(x => x.n == m.name && Number(x.q) !== 0)
                const budgetM = bp.budget.sheet?.materials[m.name]
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
        const { c: { diff } }: LastRequiredState = useSelector(getLast);
        if (diff) {
            let onNeeded = false
            bp.c.materials?.forEach((m: BlueprintWebMaterial) => {
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
        <WebDataControl w={bp.web?.blueprint} name='Blueprint' dispatchReload={() => reloadBlueprint(bp.name)} showWithErrors={true} content={webBp => <>
            { showBudget && <>
                <p>Budget Page: { bp.budget.loading ?
                <><img className='img-loading' src='img/loading.gif' />{StageText[bp.budget.stage]}...</> :
                <button onClick={(e) => {
                    e.stopPropagation();
                    dispatch(startBudgetPageLoading(bp.name))
                }}>{bp.budget.hasPage ? 'Refresh' : 'Create'}</button>
                }</p>
                <p>Crafting Session: {
                    activeSession !== undefined && bp.name !== activeSession ? <>{activeSession}</> :
                    <SessionInfo name={bp.name} session={bp.session} dispatch={dispatch} message={message} showMoveAll={showMoveAll} />
                }</p>
            </> }
            <p className='item-row pointer' onClick={(e) => {
                e.stopPropagation();
                dispatch(showBlueprintMaterialData(bp.name, bp.chain === bp.c?.itemName ? undefined : bp.c?.itemName))
            }}>Item: {bp.c?.itemName} <img src={bp.chain === bp.c?.itemName ? 'img/left.png' : 'img/right.png'}/></p>
            <p>{webBp && `Type: ${webBp.type.toString()}`}</p>
            <table ref={tableRef}>
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
                        bp.c?.materials?.map((m: BlueprintMaterial) => {
                            const name = itemStringFromName(bp, m.name)
                            return <tr key={m.name} className='item-row stable pointer' onClick={(e) => {
                                e.stopPropagation();
                                dispatch(showBlueprintMaterialData(bp.name, bp.chain === m.name ? undefined : m.name))
                            }}>
                                <td align='right'>{m.quantity === 0 ? '-' : m.quantity}</td>
                                <td align='right'>{addZeroes(m.value)}</td>
                                <td data-text={name}>
                                    {name}
                                    <img src={bp.chain === m.name ? 'img/left.png' : 'img/right.png'}/>
                                </td>
                                <td data-text={m.type.toString()}>{m.type.toString()}</td>
                                { m.available ? <td data-text-right={m.available}>{m.available}</td> : <td/> }
                                { m.clicks !== undefined ? <td data-text-right={m.clicks}>{m.clicks}</td> : <td/> }
                                { markupMap && <td align='right'>{markupMap[m.name] && markupMap[m.name] !== 1 ? `${(markupMap[m.name] * 100).toFixed(2)}%` : ''}</td> }
                                { budgetMap && <td align='right'>{budgetMap[m.name]}</td> }
                                { session && <td align="right">{session[m.name]}</td> }
                                {
                                    bought !== undefined && bought[m.name] &&
                                        <td>
                                        { bp.budget.loading ?
                                            <img className='img-loading' src='img/loading.gif' /> :
                                            <>
                                                <input
                                                    type='text'
                                                    value={bought[m.name].value}
                                                    className='input-budget-buy'
                                                    onChange={(e) => dispatch(changeBudgetPageBuyCost(bp.name, m.name, e.target.value))}
                                                /> PED
                                                <button
                                                    onClick={() => dispatch(buyBudgetPageMaterial(bp.name, m.name, bought[m.name].text, bought[m.name].finalValue, bought[m.name].quantity))}>
                                                    {`${bought[m.name].text} ${Math.abs(bought[m.name].quantity)}`}</button>
                                                { bought[m.name].showFee && <>
                                                    <input
                                                        id='withFeeCheck'
                                                        type='checkbox'
                                                        checked={bought[m.name].withFee}
                                                        onChange={(e) => dispatch(changeBudgetPageBuyFee(bp.name, m.name, e.target.checked))} />
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
                bp.c?.clicks && <>
                    <p style={{ width: tableWidth }}>Clicks available: {bp.c.clicks.available} { bp.c.owned ?
                        `(limited by ${bp.c.clicks.limitingItems.join(', ')})` :
                        <>(not owned) <img style={{height: '17px', marginLeft: '2px'}} title='Not Owned' src='img/warning.png' /></> }
                    </p>
                    <p>Click TT cost: {bp.c.clicks.ttCost.toFixed(2)} PED</p>
                    { clickMUCost &&
                        <p>Click with MU cost: {clickMUCost.toFixed(2)} PED</p> }
                    { bp.c.clicks.residueNeeded > 0 &&
                        <p>Residue needed per click: {bp.c.clicks.residueNeeded.toFixed(2)} PED</p> }
                    { sessionTTprofit !== undefined &&
                        <p>Session TT profit: {sessionTTprofit.toFixed(2)} PED</p>}
                    { sessionMUprofit !== undefined &&
                        <p>Session MU profit: {sessionMUprofit.toFixed(2)} PED</p>}
                </>
            }
        </>}/>
    )
}

const CraftEdit = ({bp}: {bp: BlueprintData}) => {
    const dispatch = useDispatch()
    return (
        <>
            <table className='blueprint-edit'>
                <thead>
                    <tr>
                        <th>Quantity Needed</th>
                        <th>Material Name</th>
                    </tr>
                </thead>
                <tbody>
                    {bp.user?.materials?.map((m, i) => (
                        <tr key={i}>
                            <td><input type='text' value={m.quantity} onChange={(e) => dispatch(changeBlueprintMaterialQuantity(bp.name, i, e.target.value))}/></td>
                            <td><AutocompleteInput value={m.name} getChangeAction={(v) => changeBlueprintMaterialName(bp.name, i, v)} suggestions={i === bp.c?.suggestedMaterials?.index ? bp.c?.suggestedMaterials?.list : undefined}/></td>
                            <td><ImgButton src='img/cross.png' title='Remove Material' dispatch={() => removeBlueprintMaterial(bp.name, i)}/></td>
                            <td>{i > 0 && <ImgButton src='img/up.png' title='Move Material Up' dispatch={() => moveBlueprintMaterial(bp.name, i, i - 1)}/>}</td>
                            <td>{i < bp.user?.materials?.length - 1 && <ImgButton src='img/down.png' title='Move Material Down' dispatch={() => moveBlueprintMaterial(bp.name, i, i + 1)}/>}</td>
                        </tr>
                    ))}
                    <tr>
                        <td></td>                      
                        <td><ImgButton src='img/add.png' title='Add Material' className='craft-add-material' afterText='Add Material' dispatch={() => addBlueprintMaterial(bp.name)}/></td>
                    </tr>
                </tbody>
            </table>
        </>
    )
}

const craftMaterialFilter = (materialName: string, rawMaterials: WebLoadResponse<RawMaterialWebData[]>): string => 
    filterExact(
        rawMaterials?.data ?
            filterOr([ materialName, ...rawMaterials.data.value.map(m => m.name) ]) :
            materialName);

const CraftItemDetails = ({name, bp}: {name: string, bp: BlueprintData}) => {
    const dispatch = useDispatch()
    const mat: ItemsState = useSelector(getItems)

    const raw = name && mat.map[name]?.web?.rawMaterials
    const afterChainBpMat = name && bp.web?.blueprint?.data?.value.materials.find(m => m.name === name)
    const afterChainMat = name && (mat.map[name]?.user ?? mat.map[name]?.web?.item?.data?.value ?? afterChainBpMat)

    const editMode = name && name === mat.editModeMaterialName
    return (
        <div className='craft-chain'>
            <h2 className='pointer img-container-hover' onClick={(e) => { e.stopPropagation(); dispatch(showBlueprintMaterialData(bp.name, undefined)) }}>
                { name }<img src='img/left.png' />
                { name && <ImgButton src='img/edit.png' show={editMode} title={editMode ? 'Finish edit' : 'Edit Material'} dispatch={() => editMode ? endMaterialEditMode : startMaterialEditMode(name)}/> }
            </h2>
            <div>
                { editMode ? <>
                    <p><label>Type:</label> <AutocompleteInput value={mat.map[name].user.type?.toString() ?? ''} getChangeAction={(v) => changeMaterialType(name, v)} suggestions={mat.map[name].user?.suggestedTypes ?? []}/></p>
                    <p><label>Value:</label> <input type='text' value={mat.map[name].user.valueOnEdit} onChange={(e) => dispatch(changeMaterialValue(name, e.target.value))}/></p>
                </> : afterChainMat && <>
                    <p>Type: { afterChainMat.type?.toString() ?? '' }</p>
                    <p>Value: { addZeroes(afterChainMat.value) }</p>
                </>}
                <ItemMarkup name={name} />
                <WebDataControl w={raw} name='Raw Materials'
                    dispatchReload={() => [loadItemRawMaterials(name), loadItemData(name, afterChainBpMat)]}
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
                <ItemInventory filter={craftMaterialFilter(name, raw)} />
                <ItemNotes name={name} />
            </div>
        </div>
    )
}

const CraftBlueprint = ({bpName}: {bpName: string}) => {
    const s: CraftState = useSelector(getCraft)
    const dispatch = useDispatch()
    const { message } = useSelector(getStatus);
    const bp = s.blueprints[bpName]

    useEffect(() => {
        if (bp) return // already loaded
        dispatch(addBlueprint(bpName));
    }, [bpName]);

    if (!bp) return <></>

    const chainNames: string[] = []
    let afterChainMaterialName: string = undefined
    let afterBpChain: BlueprintData = undefined
    let lastBpChain: BlueprintData = undefined
    let chainMaterialName = bp.chain
    while (chainMaterialName) {
        afterBpChain = lastBpChain ?? bp
        if (chainMaterialName == afterBpChain.c.itemName) {
            afterChainMaterialName = chainMaterialName
            break
        }

        const nextBp = bpDataFromItemName(s, chainMaterialName)
        if (nextBp) {
            if (lastBpChain)
                chainNames.push(lastBpChain.name)
            lastBpChain = nextBp
        } else {
            afterChainMaterialName = chainMaterialName
        }
        chainMaterialName = nextBp?.chain
    }

    const editMode = s.editModeBlueprintName === bp.name
    return (
        <section>
            <div className='inline'>
                <h1 className='img-container-hover'>
                    <ImgButton
                        title='Back to list'
                        src='img/left.png'
                        beforeText={bp.name}
                        dispatch={(n: NavigateFunction) => navigateToTab(n, TabId.CRAFT)}/>
                    <StarButton bpName={bp.name} />
                    <ImgButton
                        show={editMode}
                        title={editMode ? 'Finish edit' : 'Edit Blueprint'}
                        src='img/edit.png'
                        dispatch={() => editMode ? endBlueprintEditMode : startBlueprintEditMode(bp.name)}/>
                    <CraftPlanet />
                </h1>
                {editMode ?
                    <CraftEdit bp={bp} /> :
                    <CraftSingle key={bp.name} bp={bp} activeSession={s.activeSession} message={message} />
                }
            </div>
            {!editMode &&
                <div className='inline'>
                    { chainNames.map(name =>
                        <div className='craft-chain'>
                            <h2 className='pointer img-container-hover' onClick={(e) => {
                                e.stopPropagation();
                                dispatch(showBlueprintMaterialData(name, undefined))
                            }}>
                                { name }<img src='img/right.png' />
                            </h2>
                        </div>
                    )}
                    { lastBpChain &&
                        <div className='craft-chain'>
                            <h2 className='pointer img-container-hover' onClick={(e) => {
                                e.stopPropagation();
                                dispatch(showBlueprintMaterialData(chainNames.length > 0 ? chainNames[chainNames.length - 1] : bp.name, undefined))
                            }}>
                                { lastBpChain.name }<img title='Close blueprint' src='img/left.png' />
                                <StarButton bpName={lastBpChain.name} />
                            </h2>
                            <CraftSingle key={bp.chain} bp={lastBpChain} />
                        </div>
                    }
                    { afterChainMaterialName && <CraftItemDetails name={afterChainMaterialName} bp={afterBpChain} /> }
                </div>
            }
        </section>
    )
}

export default CraftBlueprint
export { addZeroes }
