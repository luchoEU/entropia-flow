import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { Role } from '../state/role'

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
