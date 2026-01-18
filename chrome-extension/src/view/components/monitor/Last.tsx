import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { permanentExcludeOff, permanentExcludeOn, exclude, excludeWarnings, include, setExpanded, sortBy, setLastItemMode, clearLastItemMode, setLastShowMarkup, setLastShowActions } from '../../application/actions/last'
import { copyLast, setLast } from '../../application/actions/messages'
import { getCraft } from '../../application/selectors/craft'
import { getLast } from '../../application/selectors/last'
import { CraftState } from '../../application/state/craft'
import { ViewItemData } from '../../application/state/history'
import InventoryDifference from './InventoryDifference'
import ActionTree from './ActionTree'
import ExpandablePlusButton from '../common/ExpandablePlusButton'
import ImgButton from '../common/ImgButton'
import ExpandableSection from '../common/ExpandableSection2'
import { LastRequiredState } from '../../application/state/last'
import TextButton from '../common/TextButton'
import { inferActions } from '../../application/helpers/actionInference'

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
    const {
        c: {
            anyInventory,
            text,
            delta,
            diff,
        },
        expanded,
        peds,
        showMarkup,
        showActions
    }: LastRequiredState = useSelector(getLast)
    const actions = diff ? inferActions(diff) : []

    const config = {
        sortBy: sortBy,
        allowExclude: true,
        include: include,
        exclude: exclude,
        permanentExcludeOn: permanentExcludeOn,
        permanentExcludeOff: permanentExcludeOff,
        setMode: setLastItemMode,
        clearMode: clearLastItemMode,
        showPeds: true,
        showMarkup,
        movedTitle: "this item was moved by this amount, it doesn't count for the total difference (parenthesis)"
    }

    const craft: CraftState = useSelector(getCraft)
    const dispatch = useDispatch()

    let expandedClass = 'button-diff'
    const hasWarning = diff && diff.some((i: ViewItemData) => i.w === true)
    if (hasWarning)
        expandedClass += ' button-with-warning'

    if (!anyInventory)
        return <></>
    
    return (
        <ExpandableSection selector='Last' title='Current Session' subtitle='Changes in your inventory since your session started'>
            <p>
                <ExpandablePlusButton
                    expanded={expanded}
                    setExpanded={setExpanded}
                />
                <span onClick={() => dispatch(setExpanded(!expanded))}>{ text }</span>
                <span className={`difference ${getDeltaClass(delta)}`}>{ delta?.toFixed(2) }</span>
                { hasWarning &&
                    <ImgButton
                        title={ expanded ? 'Exclude all items with warnings from the sum' : 'Items with warnings, click to expand' }
                        src='img/warning.png'
                        className='img-btn-warning'
                        dispatch={() => expanded ? excludeWarnings : setExpanded(true)} />
                }
                { diff && craft.activeSession === undefined &&
                    <ImgButton
                        title='Set as Session Start'
                        src='img/tick.png'
                        className='img-btn-delta-zero'
                        dispatch={() => setLast} />
                }
                { expanded &&
                    <>
                        <ImgButton
                            title='Copy to clipboard'
                            src='img/copy.png'
                            className='img-btn-copy'
                            clickPopup='Copied!'
                            dispatch={() => copyLast} />
                        <TextButton
                            title={ showMarkup ? 'Hide markup' : 'Show markup' }
                            className={ `button-markup ${showMarkup ? 'active' : ''}` }
                            text='%'
                            dispatch={() => setLastShowMarkup(!showMarkup)} />
                        { actions && actions.length > 0 &&
                            <ImgButton
                                title={ showActions ? 'Show items list' : 'Show grouped actions' }
                                src='img/lightning.png'
                                className='img-btn-lightning'
                                dispatch={() => setLastShowActions(!showActions)} />
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
