
import React from 'react'
import { GAME_LOG_TABULAR_ENHANCER_BROKEN, GAME_LOG_TABULAR_EVENT, GAME_LOG_TABULAR_GLOBAL, GAME_LOG_TABULAR_LOOT, GAME_LOG_TABULAR_MISSING, GAME_LOG_TABULAR_RAW, GAME_LOG_TABULAR_SKILL, GAME_LOG_TABULAR_STATISTICS, GAME_LOG_TABULAR_TIER, GameLogState } from '../../application/state/log'
import SortableTabularSection from '../common/SortableTabularSection'
import ExpandableSection from '../common/ExpandableSection2'
import { TabularStateData } from '../../application/state/tabular'
import { useSelector } from 'react-redux'
import { getTabularData } from '../../application/selectors/tabular'
import { getConnection } from '../../application/selectors/connection'

function GameLogSection() {
    const s: TabularStateData = useSelector(getTabularData(GAME_LOG_TABULAR_RAW))
    const { client: { status } } = useSelector(getConnection)
    if (!status.startsWith('connected') && !s?.items)
        return <></>

    return (
        <ExpandableSection selector='GameLogSection' title='Game Log' subtitle='Log data categorized and searchable' className='flex'>
            <SortableTabularSection selector={GAME_LOG_TABULAR_LOOT} />
            <SortableTabularSection selector={GAME_LOG_TABULAR_TIER} />
            <SortableTabularSection selector={GAME_LOG_TABULAR_SKILL} />
            <SortableTabularSection selector={GAME_LOG_TABULAR_ENHANCER_BROKEN} />
            <SortableTabularSection selector={GAME_LOG_TABULAR_GLOBAL} />
            <SortableTabularSection selector={GAME_LOG_TABULAR_STATISTICS} />
            <SortableTabularSection selector={GAME_LOG_TABULAR_EVENT} />
            <SortableTabularSection selector={GAME_LOG_TABULAR_MISSING} />
            <SortableTabularSection selector={GAME_LOG_TABULAR_RAW} useTable={true} />
        </ExpandableSection>
    )
}

export default GameLogSection
