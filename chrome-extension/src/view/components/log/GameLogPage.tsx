import React from 'react'
import { useSelector } from 'react-redux'
import { GAME_LOG_TABULAR_ENHANCER_BRAKE, GAME_LOG_TABULAR_EVENT, GAME_LOG_TABULAR_GLOBAL, GAME_LOG_TABULAR_LOOT, GAME_LOG_TABULAR_MISSING, GAME_LOG_TABULAR_RAW, GAME_LOG_TABULAR_SKILL, GAME_LOG_TABULAR_STATISTICS, GAME_LOG_TABULAR_TIER, GameLogState } from '../../application/state/log'
import { getGameLog } from '../../application/selectors/log'
import SortableTabularSection from '../common/SortableTabularSection'

function GameLogPage() {
    const s: GameLogState = useSelector(getGameLog)
    
    return (
        <div className='flex'>
            <SortableTabularSection selector={GAME_LOG_TABULAR_LOOT} />
            <SortableTabularSection selector={GAME_LOG_TABULAR_TIER} />
            <SortableTabularSection selector={GAME_LOG_TABULAR_SKILL} />
            <SortableTabularSection selector={GAME_LOG_TABULAR_ENHANCER_BRAKE} />
            <SortableTabularSection selector={GAME_LOG_TABULAR_GLOBAL} />
            <SortableTabularSection selector={GAME_LOG_TABULAR_EVENT} />
            <SortableTabularSection selector={GAME_LOG_TABULAR_STATISTICS} />
            <SortableTabularSection selector={GAME_LOG_TABULAR_MISSING} />
            <SortableTabularSection selector={GAME_LOG_TABULAR_RAW} useTable={true} />
        </div>
    )
}

export default GameLogPage