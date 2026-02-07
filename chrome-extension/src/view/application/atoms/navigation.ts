import { atomWithStorage } from 'jotai/utils'

/**
 * Navigation Last Visited State
 *
 * Tracks the last visited path for each tab ID.
 * Persists across extension reloads for better UX - users maintain their tab positions.
 *
 * Example:
 * {
 *   "inventory": "/inventory/owned",
 *   "craft": "/craft/blueprints",
 *   "stream": "/stream/viewer"
 * }
 */
export const lastVisitedByTabAtom = atomWithStorage<Record<string, string>>(
  'jotai-v1-navigation-lastVisited',
  {}
)
