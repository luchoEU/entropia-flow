import { TabId } from './navigation'

enum Role {
    HUNTER = 'hunter',
    TRADER = 'trader',
    STORAGE = 'storage',
    ADVANCED = 'advanced'
}

const ROLES = Object.values(Role)

type RoleFavorites = Record<string, string[]> // role → layout IDs

const ROLE_TAB_MAP: Record<Role, TabId[]> = {
    [Role.HUNTER]: [],   // No tabs — dashboard only
    [Role.TRADER]: [],   // No tabs — dashboard only
    [Role.STORAGE]: [],  // No tabs — dashboard only
    [Role.ADVANCED]: []  // Empty = show all (no filtering)
}

const ROLE_LABELS: Record<Role, string> = {
    [Role.HUNTER]: 'Hunter',
    [Role.TRADER]: 'Trader',
    [Role.STORAGE]: 'Storage',
    [Role.ADVANCED]: 'Advanced'
}

const ROLE_EMOJIS: Record<Role, string> = {
    [Role.HUNTER]: '🎯',
    [Role.TRADER]: '💰',
    [Role.STORAGE]: '📦',
    [Role.ADVANCED]: '⚙️'
}

export {
    Role,
    ROLES,
    RoleFavorites,
    ROLE_TAB_MAP,
    ROLE_LABELS,
    ROLE_EMOJIS
}
