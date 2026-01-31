import * as settingsAtoms from './settings'
import * as inventoryAtoms from './inventory'
import * as activityAtoms from './activity'
import * as lastAtoms from './last'
import * as historyAtoms from './history'
import * as gameLogAtoms from './gameLog'

export type AtomType = 'state' | 'computed' | 'action' | 'loading'

// Module metadata - defined once, derived everywhere else
export const moduleRegistry = [
    { id: 'settings', name: 'Settings' },
    { id: 'inventory', name: 'Inventory' },
    { id: 'activity', name: 'Activity' },
    { id: 'last', name: 'Last' },
    { id: 'history', name: 'History' },
    { id: 'gameLog', name: 'Game Log' }
] as const

export type ModuleType = typeof moduleRegistry[number]['id']

export interface AtomMetadata {
    name: string
    type: AtomType
    atom: any
    module: ModuleType
}

/**
 * Auto-discover all atoms from a module by looking for exports ending with "Atom"
 * Type defaults to 'state' - the debug page handles read errors gracefully
 */
const discoverAtoms = (module: any, moduleName: ModuleType): AtomMetadata[] => {
    return Object.entries(module)
        .filter(([name]) => name.endsWith('Atom'))
        .map(([name, atom]) => ({
            name,
            atom,
            module: moduleName,
            type: 'state' as AtomType // Default type - debug page handles read errors
        }))
        .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically for consistent display
}

// Auto-discovered registry - automatically includes all atoms from all modules
export const atomRegistry: AtomMetadata[] = [
    ...discoverAtoms(settingsAtoms, 'settings'),
    ...discoverAtoms(inventoryAtoms, 'inventory'),
    ...discoverAtoms(activityAtoms, 'activity'),
    ...discoverAtoms(lastAtoms, 'last'),
    ...discoverAtoms(historyAtoms, 'history'),
    ...discoverAtoms(gameLogAtoms, 'gameLog'),
]

export const getAtomsByModule = (moduleName: ModuleType): AtomMetadata[] => {
    return atomRegistry.filter(a => a.module === moduleName)
}

export const getAtomsByType = (type: AtomType): AtomMetadata[] => {
    return atomRegistry.filter(a => a.type === type)
}

export interface ModuleInfo {
    id: ModuleType
    name: string
}

export const getModules = (): ModuleInfo[] => {
    // Get unique modules from atomRegistry
    const uniqueModuleIds = Array.from(new Set(atomRegistry.map(a => a.module)))
    return moduleRegistry.filter(mod => uniqueModuleIds.includes(mod.id))
}
