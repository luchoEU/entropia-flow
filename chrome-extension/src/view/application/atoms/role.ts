import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { Role, RoleFavorites } from '../state/role'

/**
 * Persisted role selection - defaults to ADVANCED so existing users see no change
 */
export const roleAtom = atomWithStorage<Role>('jotai-v1-role', Role.ADVANCED)

/**
 * Persisted previous role - used for "back" navigation from Advanced mode
 */
export const previousRoleAtom = atomWithStorage<Role>('jotai-v1-previousRole', Role.HUNTER)

/**
 * Setter atom for role selection - saves outgoing role before switching
 */
export const setRoleAtom = atom(
    null,
    (get, set, role: Role) => {
        const current = get(roleAtom)
        if (current !== role) {
            set(previousRoleAtom, current)
        }
        set(roleAtom, role)
    }
)

/**
 * Persisted layout favorites per role
 */
export const favoritesAtom = atomWithStorage<RoleFavorites>('jotai-v1-favorites', {})

/**
 * Toggle a layout as favorite for a given role
 */
export const toggleFavoriteAtom = atom(
    null,
    (get, set, { role, layoutId }: { role: string, layoutId: string }) => {
        const favorites = { ...get(favoritesAtom) }
        const list = favorites[role] ?? []
        if (list.includes(layoutId)) {
            favorites[role] = list.filter(id => id !== layoutId)
        } else {
            favorites[role] = [...list, layoutId]
        }
        set(favoritesAtom, favorites)
    }
)
