import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { GameLogState } from '../../application/state/log'
import { getGameLog } from '../../application/selectors/log'
import ExpandableSection from '../common/ExpandableSection'
import { setGameLogLootExpanded, sortLootBy } from '../../application/actions/log'

function GameSplitPage() {
    const s: GameLogState = useSelector(getGameLog)
    
    return (
        <>
            <ExpandableSection title='Total' expanded={s.loot.expanded} setExpanded={setGameLogLootExpanded}>
                <table className='table-diff'>
                    <tbody>
                    </tbody>
                </table>
            </ExpandableSection>
        </>
    )
}

export default GameSplitPage