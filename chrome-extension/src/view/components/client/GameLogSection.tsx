
import React from 'react'
import {
  GAME_LOG_TABULAR_ENHANCER_BROKEN,
  GAME_LOG_TABULAR_EVENT,
  GAME_LOG_TABULAR_GLOBAL,
  GAME_LOG_TABULAR_LOOT,
  GAME_LOG_TABULAR_MISSING,
  GAME_LOG_TABULAR_RAW,
  GAME_LOG_TABULAR_SKILL,
  GAME_LOG_TABULAR_STATISTICS,
  GAME_LOG_TABULAR_TIER,
  GAME_LOG_TABULAR_TRADE
} from '../../application/state/log'
import ExpandableSection from '../common/ExpandableSection2'
import { useAtomValue } from 'jotai'
import { connectionAtom } from '../../application/atoms/connection'
import { JotaiSortableTableSection } from '../common/jotai/JotaiSortableTableSection'
import {
  gameLogLootItemsAtom,
  gameLogTierItemsAtom,
  gameLogSkillItemsAtom,
  gameLogEnhancerBrokenItemsAtom,
  gameLogGlobalItemsAtom,
  gameLogStatisticsItemsAtom,
  gameLogEventItemsAtom,
  gameLogMissingItemsAtom,
  gameLogRawItemsAtom,
  gameLogTradeItemsAtom
} from '../../application/atoms/gameLogTables'
import {
  gameLogLootConfig,
  gameLogTierConfig,
  gameLogSkillConfig,
  gameLogEnhancerBrokenConfig,
  gameLogGlobalConfig,
  gameLogStatisticsConfig,
  gameLogEventConfig,
  gameLogMissingConfig,
  gameLogRawConfig,
  gameLogTradeConfig
} from '../../application/configs/gameLogTableConfigs'
import { currentGameLogDataAtom } from '../../application/atoms/gameLog'

function GameLogSection() {
  const { client: { status } } = useAtomValue(connectionAtom)
  const gameLogData = useAtomValue(currentGameLogDataAtom)

  if (!status.startsWith('connected') && !gameLogData?.raw)
    return <></>

  return (
    <ExpandableSection selector='GameLogSection' title='Game Log' subtitle='Log data categorized and searchable' className='flex'>
      <JotaiSortableTableSection
        selector={GAME_LOG_TABULAR_LOOT}
        title='Loot'
        subtitle='List with your looted items'
        itemsAtom={gameLogLootItemsAtom}
        config={gameLogLootConfig}
      />
      <JotaiSortableTableSection
        selector={GAME_LOG_TABULAR_TIER}
        title='Tier'
        subtitle='List with your tiers reached'
        itemsAtom={gameLogTierItemsAtom}
        config={gameLogTierConfig}
      />
      <JotaiSortableTableSection
        selector={GAME_LOG_TABULAR_SKILL}
        title='Skill'
        subtitle='List with your skills gained'
        itemsAtom={gameLogSkillItemsAtom}
        config={gameLogSkillConfig}
      />
      <JotaiSortableTableSection
        selector={GAME_LOG_TABULAR_ENHANCER_BROKEN}
        title='Enhancer Broken'
        subtitle='List with the Enhancers Broken'
        itemsAtom={gameLogEnhancerBrokenItemsAtom}
        config={gameLogEnhancerBrokenConfig}
      />
      <JotaiSortableTableSection
        selector={GAME_LOG_TABULAR_GLOBAL}
        title='Global'
        subtitle='List of all globals'
        itemsAtom={gameLogGlobalItemsAtom}
        config={gameLogGlobalConfig}
      />
      <JotaiSortableTableSection
        selector={GAME_LOG_TABULAR_STATISTICS}
        title='Statistics'
        subtitle='List with counters for your game actions'
        itemsAtom={gameLogStatisticsItemsAtom}
        config={gameLogStatisticsConfig}
      />
      <JotaiSortableTableSection
        selector={GAME_LOG_TABULAR_EVENT}
        title='Events'
        subtitle='List of other messages'
        itemsAtom={gameLogEventItemsAtom}
        config={gameLogEventConfig}
      />
      <JotaiSortableTableSection
        selector={GAME_LOG_TABULAR_MISSING}
        title='Missing'
        subtitle='Messages not recognized, please report them'
        itemsAtom={gameLogMissingItemsAtom}
        config={gameLogMissingConfig}
      />
      <JotaiSortableTableSection
        selector={GAME_LOG_TABULAR_RAW}
        title='Full log'
        subtitle='Raw log, all the entries'
        itemsAtom={gameLogRawItemsAtom}
        config={gameLogRawConfig}
        useFixedSizeList={true}
      />
      <JotaiSortableTableSection
        selector={GAME_LOG_TABULAR_TRADE}
        title='Trade'
        subtitle='List of trade related messages on chat'
        itemsAtom={gameLogTradeItemsAtom}
        config={gameLogTradeConfig}
        useFixedSizeList={true}
      />
    </ExpandableSection>
  )
}

export default GameLogSection
