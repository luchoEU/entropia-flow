import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { Role } from '../state/role'

/**
 * Persisted role selection - defaults to ADVANCED so existing users see no change
 */
export const roleAtom = atomWithStorage<Role>('jotai-v1-role', Role.ADVANCED)

/**
 * Setter atom for role selection
 */
export const setRoleAtom = atom(
    null,
    (_get, set, role: Role) => {
        set(roleAtom, role)
    }
)
