import { TabId } from './navigation'

enum Role {
    HUNTER = 'hunter',
    ADVANCED = 'advanced'
    // Future: MINER, CRAFTER, TRADER
}

const ROLE_TAB_MAP: Record<Role, TabId[]> = {
    [Role.HUNTER]: [],  // No tabs — dashboard only
    [Role.ADVANCED]: [] // Empty = show all (no filtering)
}

const ROLE_LABELS: Record<Role, string> = {
    [Role.HUNTER]: 'Hunter',
    [Role.ADVANCED]: 'Advanced'
}

export {
    Role,
    ROLE_TAB_MAP,
    ROLE_LABELS
}
