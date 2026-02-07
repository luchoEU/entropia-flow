import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { ModuleType, atomRegistry } from './atomRegistry'
import type { AtomMetadata } from './atomRegistry'

/**
 * Debug page UI state - persisted
 * Maintains search query and selected module filter across navigation
 */
export interface DebugPageUiState {
  searchQuery: string
  selectedModule: 'all' | ModuleType
}

/**
 * Debug page UI atom
 * Persists search filter and module selection to localStorage
 */
export const debugPageUiAtom = atomWithStorage<DebugPageUiState>(
  'jotai-v1-debug-pageUi',
  {
    searchQuery: '',
    selectedModule: 'all'
  }
)

/**
 * Pinned atoms state - persisted
 * Stores list of atom names that should be displayed globally
 */
export interface PinnedAtomsState {
  list: string[]
  expanded: boolean
}

export const pinnedAtomsAtom = atomWithStorage<PinnedAtomsState>(
  'jotai-v1-debug-pinnedAtoms',
  {
    list: [],
    expanded: true
  }
)

/**
 * Toggle pin status for an atom
 * Adds to list if not pinned, removes if already pinned
 */
export const toggleAtomPinnedAtom = atom(
  null,
  (get, set, atomName: string) => {
    const current = get(pinnedAtomsAtom)
    const isPinned = current.list.includes(atomName)
    const list = isPinned
      ? current.list.filter(n => n !== atomName)
      : [...current.list, atomName]
    set(pinnedAtomsAtom, { ...current, list })
  }
)

/**
 * Computed atom - filters atomRegistry to get metadata for pinned atoms
 * Returns atoms in the order they were pinned
 */
export const pinnedAtomListAtom = atom((get) => {
  const { list } = get(pinnedAtomsAtom)
  return list
    .map((name: string) => atomRegistry.find((a: AtomMetadata) => a.name === name))
    .filter((a: AtomMetadata | undefined): a is AtomMetadata => a !== undefined)
})

/**
 * Toggle expanded state for pinned atoms panel
 */
export const togglePinnedAtomsPanelAtom = atom(
  null,
  (get, set) => {
    const current = get(pinnedAtomsAtom)
    set(pinnedAtomsAtom, { ...current, expanded: !current.expanded })
  }
)
