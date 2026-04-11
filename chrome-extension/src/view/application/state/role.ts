import { TabId } from './navigation'

enum Role {
    HUNTER = 'hunter',
    TRADER = 'trader',
    COLLECTOR = 'collector',
    ADVANCED = 'advanced'
}

const ROLES = Object.values(Role)

type RoleFavorites = Record<string, string[]> // role → layout IDs

const ROLE_TAB_MAP: Record<Role, TabId[]> = {
    [Role.HUNTER]: [],    // No tabs — dashboard only
    [Role.TRADER]: [],    // No tabs — dashboard only
    [Role.COLLECTOR]: [], // No tabs — dashboard only
    [Role.ADVANCED]: []   // Empty = show all (no filtering)
}

const ROLE_LABELS: Record<Role, string> = {
    [Role.HUNTER]: 'Hunter',
    [Role.TRADER]: 'Trader',
    [Role.COLLECTOR]: 'Collector',
    [Role.ADVANCED]: 'Advanced'
}

const ROLE_EMOJIS: Record<Role, string> = {
    [Role.HUNTER]: '🎯',
    [Role.TRADER]: '💰',
    [Role.COLLECTOR]: '📦',
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
