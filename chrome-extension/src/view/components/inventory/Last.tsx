import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { exclude, excludeWarnings, include, setExpanded, sortBy } from '../../application/actions/last'
import { setLast } from '../../application/actions/messages'
import { LastRequiredState } from '../../application/helpers/last'
import { getLast } from '../../application/selectors/last'
import { ViewItemData } from '../../application/state/history'
import InventoryDifference from './InventoryDifference'

const Last = () => {
    const dispatch = useDispatch()
    const {
        show,
        text,
        delta,
        deltaClass,
        expanded,
        diff,
        peds
    }: LastRequiredState = useSelector(getLast)

    const config = {
        sortBy: (part: number) => () => dispatch(sortBy(part)),
        allowExclude: true,
        include: (key: number) => dispatch(include(key)),
        exclude: (key: number) => dispatch(exclude(key)),
        showPeds: true,
        movedTitle: "this item was moved by this amount, it doesn't count for the total difference (parenthesis)"
    }

    let expandedClass = 'button-diff'
    const hasWarning = diff && diff.some((i: ViewItemData) => i.w === true)
    if (hasWarning)
        expandedClass += ' button-with-warning'

    if (show) {
        return (
            <section>
                <h1>Last</h1>
                <p>
                    <button
                        className={expandedClass}
                        onClick={() => dispatch(setExpanded(!expanded))}
                    >
                        {diff === null ? '' : (expanded ? '-' : '+')}
                    </button>
                    {text}
                    <span className={'difference ' + deltaClass}>{delta}</span>
                    {hasWarning ?
                        <img src='img/warning.png'
                            className='img-warning'
                            onClick={() => dispatch(expanded ? excludeWarnings : setExpanded(true))} />
                        : ''
                    }
                    {diff !== null ?
                        <img src='img/tick.png'
                            className='img-delta-zero'
                            onClick={() => dispatch(setLast)} />
                        : ''
                    }
                </p>
                {expanded ?
                    <InventoryDifference
                        diff={diff}
                        peds={peds}
                        config={config} />
                    : ''
                }
            </section>
        )
    } else {
        return <></>
    }
}

export default Last