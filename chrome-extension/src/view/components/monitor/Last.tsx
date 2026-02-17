import React from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { isFeatureEnabledAtom } from '../../application/atoms/settings'
import { Feature } from '../../application/state/settings'
import { ViewItemData } from '../../application/state/history'
import InventoryDifference, { InventoryDifferenceConfig } from './InventoryDifference'
import ActionTree from './ActionTree'
import ExpandablePlusButton from '../common/ExpandablePlusButton'
import ImgButton from '../common/ImgButton'
import ExpandableSection from '../common/ExpandableSection'
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
    copyLastAtom
} from '../../application/atoms/last'
import { createNewSessionAtom } from '../../application/atoms/activity'
import { activeSessionAtom } from '../../application/atoms/craft'

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

export const Last = () => {
    // Jotai state for craft
    const activeSession = useAtomValue(activeSessionAtom)
    // Jotai state (for settings)
    const useComma = useAtomValue(isFeatureEnabledAtom(Feature.commaDecimalSeparator))

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
    const createNewSession = useSetAtom(createNewSessionAtom)
    const copyLast = useSetAtom(copyLastAtom)

    const actions = diff ? inferActions(diff) : []

    // Config for InventoryDifference - return Jotai promises for proper async handling
    const config: InventoryDifferenceConfig = {
        sortBy: (part: number) => { sortBy(part); return undefined as any },
        allowExclude: true,
        include: (key: number) => includeItem(key),
        exclude: (key: number) => excludeItem(key),
        permanentExcludeOn: (key: number) => permanentExcludeOn(key),
        permanentExcludeOff: (key: number) => permanentExcludeOff(key),
        showPeds: true,
        showMarkup,
        movedTitle: "this item was moved by this amount, it doesn't count for the total difference (parenthesis)"
    }

    const hasWarning = diff && diff.some((i: ViewItemData) => i.w === true)

    if (!anyInventory)
        return <></>

    return (
        <ExpandableSection selector='Last' title='Current Session' subtitle='Changes in your inventory since your session started'>
            <p className="img-hover-container flex" style={{ alignItems: 'center', gap: '10px', flexWrap: 'nowrap', justifyContent: 'flex-start' }}>
                <span onClick={() => setExpanded(!expanded)}>
                    <ExpandablePlusButton
                        expanded={expanded}
                        setExpanded={setExpanded}
                    />
                    { text }
                </span>
                <span className={`difference ${getDeltaClass(delta)}`}>{ delta?.toFixed(2) }</span>
                { hasWarning &&
                    <ImgButton
                        title={ expanded ? 'Exclude all items with warnings from the sum' : 'Items with warnings, click to expand' }
                        src='img/warning.png'
                        className='img-btn-warning'
                        show
                        action={() => {
                            if (expanded) {
                                excludeWarnings()
                                return undefined
                            }
                            setExpanded(true)
                            return undefined
                        }} />
                }
                { diff && activeSession === undefined &&
                    <ImgButton
                        title='Set as Session Start'
                        src='img/tick.png'
                        className='img-btn-delta-zero'
                        show
                        action={() => { createNewSession(); return undefined }} />
                }
                { expanded &&
                    <>
                        <ImgButton
                            title='Copy to clipboard'
                            src='img/copy.png'
                            className='img-btn-copy'
                            clickPopup='Copied!'
                            action={() => { copyLast(useComma); return undefined }} />
                        <TextButton
                            title={ showMarkup ? 'Hide markup' : 'Show markup' }
                            className={ `button-markup ${showMarkup ? 'active' : ''}` }
                            text='%'
                            action={() => { setShowMarkup(!showMarkup); return undefined }} />
                        { actions && actions.length > 0 &&
                            <ImgButton
                                title={ showActions ? 'Show items list' : 'Show grouped actions' }
                                src='img/lightning.png'
                                className='img-btn-lightning'
                                action={() => { setShowActions(!showActions); return undefined }} />
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
