import { atom } from 'jotai'
import { currentGameLogDataAtom } from './gameLog'
import {
  GAME_LOG_TABULAR_LOOT,
  GAME_LOG_TABULAR_TIER,
  GAME_LOG_TABULAR_SKILL,
  GAME_LOG_TABULAR_ENHANCER_BROKEN,
  GAME_LOG_TABULAR_GLOBAL,
  GAME_LOG_TABULAR_STATISTICS,
  GAME_LOG_TABULAR_EVENT,
  GAME_LOG_TABULAR_MISSING,
  GAME_LOG_TABULAR_RAW,
  GAME_LOG_TABULAR_TRADE
} from '../state/log'

/**
 * Game Log Table Atoms
 * Derived atoms that extract specific data from currentGameLogDataAtom for each table type
 */

export const gameLogLootItemsAtom = atom((get) => {
  const data = get(currentGameLogDataAtom)
  return data?.loot ?? []
})

export const gameLogTierItemsAtom = atom((get) => {
  const data = get(currentGameLogDataAtom)
  return data?.tier ?? []
})

export const gameLogSkillItemsAtom = atom((get) => {
  const data = get(currentGameLogDataAtom)
  return data?.skill ?? []
})

export const gameLogEnhancerBrokenItemsAtom = atom((get) => {
  const data = get(currentGameLogDataAtom)
  return data?.enhancerBroken ?? []
})

export const gameLogGlobalItemsAtom = atom((get) => {
  const data = get(currentGameLogDataAtom)
  return data?.global ?? []
})

export const gameLogStatisticsItemsAtom = atom((get) => {
  const data = get(currentGameLogDataAtom)
  return Object.entries(data?.stats ?? {})
})

export const gameLogEventItemsAtom = atom((get) => {
  const data = get(currentGameLogDataAtom)
  return data?.event ?? []
})

export const gameLogMissingItemsAtom = atom((get) => {
  const data = get(currentGameLogDataAtom)
  return data?.raw.filter(d => !d.player && Object.keys(d.data).length === 0) ?? []
})

export const gameLogRawItemsAtom = atom((get) => {
  const data = get(currentGameLogDataAtom)
  return data?.raw ?? []
})

export const gameLogTradeItemsAtom = atom((get) => {
  const data = get(currentGameLogDataAtom)
  return data?.trade ?? []
})
