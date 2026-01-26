import React from 'react'
import { useSelector } from 'react-redux'
import { useAtomValue, useSetAtom } from 'jotai'
import { getCraft } from '../../application/selectors/craft'
import { selectIsFeatureEnabled } from '../../application/selectors/settings'
import { CraftState } from '../../application/state/craft'
import { Feature } from '../../application/state/settings'
import { ViewItemData } from '../../application/state/history'
import InventoryDifference from './InventoryDifference'
import ActionTree from './ActionTree'
import ExpandablePlusButton from '../common/ExpandablePlusButton'
import ImgButton from '../common/ImgButton'
import ExpandableSection from '../common/ExpandableSection2'
import TextButton from '../common/TextButton'
import { inferActions } from '../../application/helpers/actionInference'
import {
    lastPersistedAtom,
    lastComputedAtom,
    setExpandedAtom,
    setLastShowMarkupAtom,
    setLastShowActionsAtom,
    sortByAtom,
    includeItemAtom,
    excludeItemAtom,
    excludeWarningsAtom,
    permanentExcludeOnAtom,
    permanentExcludeOffAtom,
    setLastItemModeAtom,
    copyLastAtom
} from '../../application/atoms/last'
import { createNewSessionAtom } from '../../application/atoms/activity'

function getDeltaClass(delta: number | undefined) {
    if (delta === undefined || Math.abs(delta) < 0.005)
        delta = 0
    if (delta > 0) {
        return 'positive'
    } else if (delta < 0) {
        return 'negative'
    } else {
        return ''
    }
}

const Last = () => {
    // Redux state (only for craft session check and settings)
    const craft: CraftState = useSelector(getCraft)
    const useComma = useSelector(selectIsFeatureEnabled(Feature.commaDecimalSeparator))

    // Jotai state
    const { expanded, showMarkup, showActions, peds } = useAtomValue(lastPersistedAtom)
    const { anyInventory, text, delta, diff } = useAtomValue(lastComputedAtom)

    // Jotai setters
    const setExpanded = useSetAtom(setExpandedAtom)
    const setShowMarkup = useSetAtom(setLastShowMarkupAtom)
    const setShowActions = useSetAtom(setLastShowActionsAtom)
    const sortBy = useSetAtom(sortByAtom)
    const includeItem = useSetAtom(includeItemAtom)
    const excludeItem = useSetAtom(excludeItemAtom)
    const excludeWarnings = useSetAtom(excludeWarningsAtom)
    const permanentExcludeOn = useSetAtom(permanentExcludeOnAtom)
    const permanentExcludeOff = useSetAtom(permanentExcludeOffAtom)
    const setLastItemMode = useSetAtom(setLastItemModeAtom)
    const createNewSession = useSetAtom(createNewSessionAtom)
    const copyLast = useSetAtom(copyLastAtom)

    const actions = diff ? inferActions(diff) : []

    // Config for InventoryDifference - wrap Jotai setters to return undefined
    const config = {
        sortBy: (part: number) => { sortBy(part); return undefined as any },
        allowExclude: true,
        include: (key: number) => { includeItem(key); return undefined as any },
        exclude: (key: number) => { excludeItem(key); return undefined as any },
        permanentExcludeOn: (key: number) => { permanentExcludeOn(key); return undefined as any },
        permanentExcludeOff: (key: number) => { permanentExcludeOff(key); return undefined as any },
        setMode: (key: number, type: number, data: any) => { setLastItemMode({ key, mode: { type, data } }); return undefined as any },
        clearMode: (key: number) => { setLastItemMode({ key, mode: undefined }); return undefined as any },
        showPeds: true,
        showMarkup,
        movedTitle: "this item was moved by this amount, it doesn't count for the total difference (parenthesis)"
    }

    const hasWarning = diff && diff.some((i: ViewItemData) => i.w === true)

    if (!anyInventory)
        return <></>

    return (
        <ExpandableSection selector='Last' title='Current Session' subtitle='Changes in your inventory since your session started'>
            <p>
                <ExpandablePlusButton
                    expanded={expanded}
                    setExpanded={setExpanded}
                />
                <span onClick={() => setExpanded(!expanded)}>{ text }</span>
                <span className={`difference ${getDeltaClass(delta)}`}>{ delta?.toFixed(2) }</span>
                { hasWarning &&
                    <ImgButton
                        title={ expanded ? 'Exclude all items with warnings from the sum' : 'Items with warnings, click to expand' }
                        src='img/warning.png'
                        className='img-btn-warning'
                        dispatch={() => {
                            if (expanded) {
                                excludeWarnings()
                                return undefined
                            }
                            setExpanded(true)
                            return undefined
                        }} />
                }
                { diff && craft.activeSession === undefined &&
                    <ImgButton
                        title='Set as Session Start'
                        src='img/tick.png'
                        className='img-btn-delta-zero'
                        dispatch={() => { createNewSession(); return undefined }} />
                }
                { expanded &&
                    <>
                        <ImgButton
                            title='Copy to clipboard'
                            src='img/copy.png'
                            className='img-btn-copy'
                            clickPopup='Copied!'
                            dispatch={() => { copyLast(useComma); return undefined }} />
                        <TextButton
                            title={ showMarkup ? 'Hide markup' : 'Show markup' }
                            className={ `button-markup ${showMarkup ? 'active' : ''}` }
                            text='%'
                            dispatch={() => { setShowMarkup(!showMarkup); return undefined }} />
                        { actions && actions.length > 0 &&
                            <ImgButton
                                title={ showActions ? 'Show items list' : 'Show grouped actions' }
                                src='img/lightning.png'
                                className='img-btn-lightning'
                                dispatch={() => { setShowActions(!showActions); return undefined }} />
                        }
                    </>
                }
            </p>
            { expanded &&
                <>
                    { showActions && actions && actions.length > 0 ?
                        <ActionTree actions={actions} /> :
                        <InventoryDifference
                            diff={diff}
                            peds={peds}
                            config={config} />
                    }
                </>
            }
        </ExpandableSection>
    )
}

export default Last
