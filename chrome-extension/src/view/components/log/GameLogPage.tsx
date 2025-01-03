import React from 'react'
import { useSelector } from 'react-redux'
import { GAME_LOG_TABULAR_GLOBAL, GAME_LOG_TABULAR_LOOT, GAME_LOG_TABULAR_MISSING, GAME_LOG_TABULAR_RAW, GAME_LOG_TABULAR_SKILL, GAME_LOG_TABULAR_STATISTICS, GameLogState } from '../../application/state/log'
import { getGameLog } from '../../application/selectors/log'
import { GameLogGlobal, GameLogLine, GameLogLoot, GameLogSkill } from '../../../background/client/gameLogData'
import SortableTabularSection from '../common/SortableTabularSection'

function GameLogPage() {
    const s: GameLogState = useSelector(getGameLog)
    
    return (
        <>
            <SortableTabularSection
                title='Loot'
                selector={GAME_LOG_TABULAR_LOOT}
                columns={['Name', 'Quantity', 'Value']}
                getRow={(g: GameLogLoot) => [g.name, g.quantity.toString(), g.value.toFixed(2) + ' PED']}
            />
            <SortableTabularSection
                title='Skill'
                selector={GAME_LOG_TABULAR_SKILL}
                columns={['Name', 'Value']}
                getRow={(g: GameLogSkill) => [g.name, g.value.toFixed(4)]}
            />
            <SortableTabularSection
                title='Global'
                selector={GAME_LOG_TABULAR_GLOBAL}
                columns={['Time', 'Player', 'Name', 'Type', 'Value']}
                getRow={(g: GameLogGlobal) => [g.time, g.player, g.name, g.type, g.value + (g.isHoF ? ' [HoF]' : '')]}
            />
            <SortableTabularSection
                title='Statistics'
                selector={GAME_LOG_TABULAR_STATISTICS}
                columns={['Name', 'Value']}
                getRow={(g: string[]) => g}
            />
            <SortableTabularSection
                title='Missing'
                selector={GAME_LOG_TABULAR_MISSING}
                columns={['Time', 'Channel', 'Message']}
                getRow={(g: GameLogLine) => [g.time, g.channel, g.message]}
            />
            <SortableTabularSection
                title='Full log'
                selector={GAME_LOG_TABULAR_RAW}
                columns={['Time', 'Channel', 'Player', 'Message', 'Data']}
                getRow={(g: GameLogLine) => [g.time, g.channel, g.player, g.message, JSON.stringify(g.data)]}
                useTable={true}
            />
        </>
    )
}

export default GameLogPage