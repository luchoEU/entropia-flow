import React, { useEffect, useCallback } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { useNavigate, NavigateFunction } from 'react-router-dom'
import { auctionFee } from '../../application/helpers/calculator'
import {
  showBlueprintMaterialData, changeBlueprintMaterialQuantity, changeBlueprintMaterialName,
  removeBlueprintMaterial, moveBlueprintMaterial, addBlueprintMaterial,
  startBlueprintEditMode, endBlueprintEditMode, reloadBlueprint,
  navigateToTab, changeBudgetPageBuyCost, buyBudgetPageMaterial, changeBudgetPageBuyFee
} from './craftStubs'
import { itemStringFromName, bpDataFromItemName, itemNameFromBpName } from '../../application/helpers/craft-utils'
import { BlueprintData, BlueprintSession, CraftState, STEP_DONE, STEP_REFRESH_ERROR, STEP_INACTIVE, STEP_READY, STEP_REFRESH_TO_END, STEP_REFRESH_TO_START, STEP_SAVING, BlueprintMaterial } from '../../application/state/craft'
import { lastComputedAtom } from '../../application/atoms/last'
import { blueprintsAtom, activeSessionAtom, editModeBlueprintNameAtom, blueprintAutoCalcAtom, suggestionMaterialsUIAtom, loadBudgetSheetAtom, startCraftingSessionAtom, clearCraftingSessionAtom, endCraftingSessionAtom } from '../../application/atoms/craft'
import { isFeatureEnabledAtom } from '../../application/atoms/settings'
import { StageText } from '../../services/api/sheets/sheetsStages'
import { ItemsMap, ItemsState } from '../../application/state/items'
import { BlueprintWebData, BlueprintWebMaterial, RawMaterialWebData } from '../../../web/state'
import { changeMaterialTypeAtom, changeMaterialValueAtom, endMaterialEditModeAtom, loadItemDataAtom, loadItemRawMaterialsAtom, startMaterialEditModeAtom, itemsMapAtom, editModeMaterialNameAtom } from '../../application/atoms/items'
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
import { Feature } from '../../application/state/settings'
import { useElementSize } from '../common/useElementSize'
import AutocompleteInput from '../common/AutocompleteInput'

function SessionInfo(p: {
    name: string,
    session: BlueprintSession,
    message: string,
    showMoveAll: boolean,
    onStart?: () => void,
    onClear?: () => void,
    onRetry?: () => void,
    onEnd?: () => void
}) {
    const { message, showMoveAll } = p
    switch (p.session?.step) {
        case STEP_INACTIVE:
            return <>
                <button onClick={() => p.onStart?.()}>🚀 Start</button>
                { showMoveAll && false ? <button>Move All</button> : <></> }
            </>
        case STEP_REFRESH_TO_START:
            return <><img className='img-loading' src='img/loading.gif' /> Refreshing items list to start...</>
        case STEP_REFRESH_TO_END:
            return <><img className='img-loading' src='img/loading.gif' /> Refreshing items list to end...</>
        case STEP_REFRESH_ERROR:
            return <>
                <span className='error'>{p.session.errorText}</span>
                <button className="wait-button" onClick={() => p.onClear?.()}>🗑️ Clear</button>
                <button className='wait-button' onClick={() => p.onRetry?.()}>🔄 Retry</button>
                <span>{message}</span>
            </>
        case STEP_READY:
            return <>Ready <button onClick={() => p.onEnd?.()}>⏹️ End</button></>
        case STEP_SAVING:
            return <>Saving <img className='img-loading' src='img/loading.gif' /> {StageText[p.session.stage!]}...</>
        case STEP_DONE:
            return <button onClick={() => p.onClear?.()}>🗑️ Clear</button>
        default:
            return <></>
    }
}

function addZeroes(n: number) {
    const dec = n.toString().split('.')[1]
    const len = dec && dec.length > 2 ? dec.length : 2
    return Number(n).toFixed(len)
}

const CraftSingle = ({ bpName, bp, activeSession, message, bpAutoCalc, loadBudgetSheet }: {
    bpName: string,
    bp: BlueprintData
    activeSession?: string,
    message?: string,
    bpAutoCalc?: any,
    loadBudgetSheet?: (bpName: string) => Promise<void>
}) => {
    const clearSession = useSetAtom(clearCraftingSessionAtom)
    const mat: ItemsMap = useAtomValue(itemsMapAtom)
    const showBudget = useAtomValue(isFeatureEnabledAtom(Feature.budget))
    const navigate = useNavigate();
    const { ref: tableRef, size: { width: tableWidth } } = useElementSize<HTMLTableElement>();

    let markupLoaded = bp.budget?.sheet?.clickMUCost !== undefined
    let markupMap: {[name: string]: number} | undefined
    let budgetMap: {[name: string]: number} | undefined
    let clickMUCost: number | undefined
    if (markupLoaded) {
        clickMUCost = bp.budget!.sheet!.clickMUCost;
        Object.entries(bp.budget!.sheet!.materials).forEach(([k, m]) => {
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
    } else if (bpAutoCalc?.materials) {
        clickMUCost = 0;
        markupMap = Object.fromEntries(bpAutoCalc.materials.map((m: BlueprintMaterial) => {
            const nMarkup = Number(mat[m.name]?.markup?.value);
            const markup = isNaN(nMarkup) ? 1 : nMarkup / 100;
            clickMUCost! += m.quantity * m.value * markup;
            return [m.name, markup];
        }))
        if (Object.values(markupMap).every(n => n === 1)) {
            markupMap = undefined
            clickMUCost = undefined
        }
    }

    let session: {[name: string]: number} | undefined
    let sessionTTprofit: number | undefined
    let sessionMUprofit: number | undefined
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

    if (bp.session?.diffMaterials !== undefined) {
        session = {}
        sessionTTprofit = 0
        if (markupLoaded)
            sessionMUprofit = 0
        bp.web?.blueprint.data!.value.materials.forEach((m: BlueprintWebMaterial) => {
            const diff = bp.session!.diffMaterials!.find(x => x.n == m.name)
            if (diff !== undefined) {
                session![m.name] = diff.q
                sessionTTprofit! += diff.v
                if (markupLoaded) {
                    sessionMUprofit! += diff.v * bp.budget!.sheet!.materials[m.name].markup
                }
            }
        })
    } else if (bp.budget!.hasPage) {
        Object.entries(bp.budget!.sheet!.materials).forEach(([k, m]) => {
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
                    text: 'Move',
                    showFee: false,
                }
                showMoveAll = true
            }
        })

        const lastComputed = useAtomValue(lastComputedAtom)
        const diff = lastComputed.diff
        if (diff) {
            bpAutoCalc?.materials?.forEach((m: BlueprintWebMaterial) => {
                const item = diff.find((x: any) => x.n == m.name && Number(x.q) !== 0)
                const budgetM = bp.budget!.sheet?.materials[m.name]
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
                        text: quantity > 0 ? 'Buy' : 'Sell',
                        showFee: quantity < 0,
                        withFee,
                        fee
                    }
                }
            })
        }
    } else {
        const lastComputed = useAtomValue(lastComputedAtom);
        const diff = lastComputed.diff;
        if (diff) {
            let onNeeded = false
            bpAutoCalc?.materials?.forEach((m: BlueprintWebMaterial) => {
                const sum = diff.filter((x: any) => x.n == m.name && !x.c.includes('⭢'))
                    .reduce((p: any, c: any) => ({ v: Number(c.v) + p.v, q: Number(c.q) + p.q }), { v: 0, q: 0 });
                if (sum.v !== 0) {
                    if (!session) {
                        session = {};
                        sessionTTprofit = 0;
                        if (markupMap)
                            sessionMUprofit = 0;
                    }

                    session![m.name] = sum.q;
                    sessionTTprofit! += sum.v;
                    sessionMUprofit! += sum.v * (markupMap?.[m.name] ?? 1);
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
    bought = undefined!

    return (
        <WebDataControl w={bp.web?.blueprint} name='Blueprint' dispatchReload={() => reloadBlueprint(bpName)} showWithErrors={true} content={(webBp: BlueprintWebData | undefined) => <>
            { showBudget && <>
                <p>Budget Page: { bp.budget?.loading ?
                    <><img className='img-loading' src='img/loading.gif' />{StageText[bp.budget.stage]}...</> :
                    <button onClick={(e) => {
                        e.stopPropagation();
                        loadBudgetSheet(bpName).catch((err) => console.error(`Failed to load budget sheet: ${err}`))
                    }}>{bp.budget?.hasPage ? 'Refresh' : 'Create'}</button>
                }</p>
                <p>Crafting Session: {
                    activeSession !== undefined && bpName !== activeSession ? <>{activeSession}</> :
                    <SessionInfo name={bpName} session={bp.session} onClear={() => clearSession(bpName)} message={message} showMoveAll={showMoveAll} />
                }</p>
            </> }
            <p className='item-row pointer' onClick={(e) => {
                e.stopPropagation();
                // TODO: Implement blueprint material data display
            }}>Item: {bpAutoCalc?.itemName} <img src={bp.chain === bpAutoCalc?.itemName ? 'img/left.png' : 'img/right.png'}/></p>
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
                        bpAutoCalc?.materials?.map((m: BlueprintMaterial) => {
                            const name = itemStringFromName(bpName, m.name)
                            return <tr key={m.name} className='item-row stable pointer' onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Implement blueprint material data display
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
                                                    disabled
                                                /> PED
                                                <button disabled>
                                                    {`${bought[m.name].text} ${Math.abs(bought[m.name].quantity)}`}</button>
                                                { bought[m.name].showFee && <>
                                                    <input
                                                        id='withFeeCheck'
                                                        type='checkbox'
                                                        checked={bought[m.name].withFee}
                                                        disabled />
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
                bpAutoCalc?.clicks && <>
                    <p style={{ width: tableWidth }}>Clicks available: {bpAutoCalc.clicks.available} { bpAutoCalc.owned ?
                        `(limited by ${bpAutoCalc.clicks.limitingItems.join(', ')})` :
                        <>(not owned) <img style={{height: '17px', marginLeft: '2px'}} title='Not Owned' src='img/warning.png' /></> }
                    </p>
                    <p>Click TT cost: {bpAutoCalc.clicks.ttCost.toFixed(2)} PED</p>
                    { clickMUCost &&
                        <p>Click with markup cost: {clickMUCost.toFixed(2)} PED</p> }
                    { bpAutoCalc.clicks.residueNeeded > 0 &&
                        <p>Residue needed per click: {bpAutoCalc.clicks.residueNeeded.toFixed(2)} PED</p> }
                    { sessionTTprofit !== undefined &&
                        <p>Session TT profit: {sessionTTprofit.toFixed(2)} PED</p>}
                    { sessionMUprofit !== undefined &&
                        <p>Session with markup profit: {sessionMUprofit.toFixed(2)} PED</p>}
                </>
            }
        </>}/>
    )
}

const CraftEdit = ({bpName, bp, bpSuggestedMaterials}: {bpName: string, bp: BlueprintData, bpSuggestedMaterials?: any}) => {
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
                        <tr key={m.name || i}>
                            <td><input type='text' disabled value={m.quantity} onChange={(e) => changeBlueprintMaterialQuantity(bpName, i, e.target.value)}/></td>
                            <td><AutocompleteInput value={m.name} getChangeAction={(v) => changeBlueprintMaterialName(bpName, i, v)} suggestions={i === bpSuggestedMaterials?.index ? bpSuggestedMaterials?.list : undefined}/></td>
                            <td><ImgButton src='img/cross.png' title='Remove Material' dispatch={() => removeBlueprintMaterial(bpName, i)}/></td>
                            <td>{i > 0 && <ImgButton src='img/up.png' title='Move Material Up' dispatch={() => moveBlueprintMaterial(bpName, i, i - 1)}/>}</td>
                            <td>{i < bp.user?.materials?.length - 1 && <ImgButton src='img/down.png' title='Move Material Down' dispatch={() => moveBlueprintMaterial(bpName, i, i + 1)}/>}</td>
                        </tr>
                    ))}
                    <tr>
                        <td></td>
                        <td><ImgButton src='img/add.png' title='Add Material' className='craft-add-material' afterText='Add Material' dispatch={() => addBlueprintMaterial(bpName)}/></td>
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

const CraftItemDetails = ({name, bpName, bp}: {name: string, bpName: string, bp: BlueprintData}) => {
    const itemsMap = useAtomValue(itemsMapAtom)
    const editModeMaterialName = useAtomValue(editModeMaterialNameAtom)
    const setMaterialType = useSetAtom(changeMaterialTypeAtom)
    const setMaterialValue = useSetAtom(changeMaterialValueAtom)
    const setEditModeEnd = useSetAtom(endMaterialEditModeAtom)
    const setEditModeStart = useSetAtom(startMaterialEditModeAtom)
    const loadRawMaterials = useSetAtom(loadItemRawMaterialsAtom)
    const loadItemDataFn = useSetAtom(loadItemDataAtom)

    const raw = name && itemsMap[name]?.web?.rawMaterials
    const afterChainBpMat = name && bp.web?.blueprint?.data?.value.materials.find(m => m.name === name)
    const afterChainMat = name && (itemsMap[name]?.user ?? itemsMap[name]?.web?.item?.data?.value ?? afterChainBpMat)

    const editMode = name && name === editModeMaterialName
    return (
        <div className='craft-chain'>
            <h2 className='pointer img-hover-container' onClick={(e) => { e.stopPropagation(); showBlueprintMaterialData(bpName, undefined) }}>
                { name }<img src='img/left.png' />
                { name && <ImgButton src='img/edit.png' show={editMode} title={editMode ? 'Finish edit' : 'Edit Material'} dispatch={() => editMode ? setEditModeEnd() : setEditModeStart(name)}/> }
            </h2>
            <div>
                { editMode ? <>
                    <p><label>Type:</label> <AutocompleteInput value={itemsMap[name].user.type?.toString() ?? ''} getChangeAction={(v) => setMaterialType(name, v)} suggestions={itemsMap[name].user?.suggestedTypes ?? []}/></p>
                    <p><label>Value:</label> <input type='text' value={itemsMap[name].user.valueOnEdit} onChange={(e) => setMaterialValue(name, e.target.value)}/></p>
                </> : afterChainMat && <>
                    <p>Type: { afterChainMat.type?.toString() ?? '' }</p>
                    <p>Value: { addZeroes(afterChainMat.value) }</p>
                </>}
                <ItemMarkup name={name} />
                <WebDataControl w={raw} name='Raw Materials'
                    dispatchReload={() => [loadRawMaterials(name), loadItemDataFn(name, afterChainBpMat)]}
                    content={d => d && d.length > 0 &&
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
                <ItemInventory />
                <ItemNotes name={name} />
            </div>
        </div>
    )
}

const CraftBlueprint = ({bpName}: {bpName: string}) => {
    const blueprints = useAtomValue(blueprintsAtom)
    const autoCalcData = useAtomValue(blueprintAutoCalcAtom)
    const suggestedMaterials = useAtomValue(suggestionMaterialsUIAtom)
    const activeSession = useAtomValue(activeSessionAtom)
    const editModeBlueprintName = useAtomValue(editModeBlueprintNameAtom)
    const loadBudgetSheet = useSetAtom(loadBudgetSheetAtom)
    const message = 'Ready';
    const bp = blueprints[bpName]
    const bpAutoCalc = autoCalcData[bpName]
    const bpSuggestedMaterials = suggestedMaterials[bpName]

    useEffect(() => {
        if (bp) return // already loaded
        // TODO: Load blueprint data
    }, [bpName, bp]);

    if (!bp) return <></>

    const chainNames: string[] = []
    let afterChainMaterialName: string | undefined = undefined
    let afterBpChain: BlueprintData | undefined = undefined
    let afterBpChainName: string | undefined = undefined
    let lastBpChain: BlueprintData | undefined = undefined
    let lastBpChainName: string | undefined = undefined
    let chainMaterialName = bp.chain
    while (chainMaterialName) {
        afterBpChain = lastBpChain ?? bp
        afterBpChainName = lastBpChainName ?? bpName
        if (chainMaterialName == itemNameFromBpName(afterBpChainName)) {
            afterChainMaterialName = chainMaterialName
            break
        }

        const nextBpResult = bpDataFromItemName(blueprints, chainMaterialName)
        if (nextBpResult) {
            const [nextBpName, nextBp] = nextBpResult
            if (lastBpChain)
                chainNames.push(lastBpChainName!)
            lastBpChain = nextBp
            lastBpChainName = nextBpName
        } else {
            afterChainMaterialName = chainMaterialName
        }
        chainMaterialName = lastBpChain?.chain
    }

    const editMode = editModeBlueprintName === bpName
    return (
        <section>
            <div className='inline'>
                <h1 className='img-hover-container'>
                    <ImgButton
                        title='Back to list'
                        src='img/left.png'
                        beforeText={bpName}
                        dispatch={(n: NavigateFunction) => navigateToTab(n, TabId.CRAFT)}/>
                    <StarButton bpName={bpName} />
                    <ImgButton
                        show={editMode}
                        title={editMode ? 'Finish edit' : 'Edit Blueprint'}
                        src='img/edit.png'
                        dispatch={() => editMode ? endBlueprintEditMode : startBlueprintEditMode(bpName)}/>
                    <CraftPlanet />
                </h1>
                {editMode ?
                    <CraftEdit bpName={bpName} bp={bp} bpSuggestedMaterials={bpSuggestedMaterials} /> :
                    <CraftSingle key={bpName} bpName={bpName} bp={bp} activeSession={activeSession} message={message} bpAutoCalc={bpAutoCalc} loadBudgetSheet={loadBudgetSheet} />
                }
            </div>
            {!editMode &&
                <div className='inline'>
                    { chainNames.map(name =>
                        <div className='craft-chain'>
                            <h2 className='pointer img-hover-container' onClick={(e) => {
                                e.stopPropagation();
                                showBlueprintMaterialData(name, undefined)
                            }}>
                                { name }<img src='img/right.png' />
                            </h2>
                        </div>
                    )}
                    { lastBpChain && lastBpChainName &&
                        <div className='craft-chain'>
                            <h2 className='pointer img-hover-container' onClick={(e) => {
                                e.stopPropagation();
                                showBlueprintMaterialData(chainNames.length > 0 ? chainNames[chainNames.length - 1] : bpName, undefined)
                            }}>
                                { lastBpChainName }<img title='Close blueprint' src='img/left.png' />
                                <StarButton bpName={lastBpChainName} />
                            </h2>
                            <CraftSingle key={bp.chain} bpName={lastBpChainName} bp={lastBpChain} bpAutoCalc={autoCalcData[lastBpChainName]} loadBudgetSheet={loadBudgetSheet} />
                        </div>
                    }
                    { afterChainMaterialName && <CraftItemDetails name={afterChainMaterialName} bpName={afterBpChainName!} bp={afterBpChain} /> }
                </div>
            }
        </section>
    )
}

export default CraftBlueprint
export { addZeroes }
