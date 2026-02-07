import * as settingsAtoms from './settings'
import * as inventoryAtoms from './inventory'
import * as activityAtoms from './activity'
import * as lastAtoms from './last'
import * as historyAtoms from './history'
import * as gameLogAtoms from './gameLog'
import * as itemsAtoms from './items'

/**
 * Categorizes atoms by their purpose:
 * - 'state': Base atoms holding primitive or object state
 * - 'computed': Derived atoms that compute values from other atoms
 * - 'action': Write atoms that perform side effects or state transformations
 * - 'loading': Atoms tracking async operation status
 */
export type AtomType = 'state' | 'computed' | 'action' | 'loading'

// Module metadata - defined once, derived everywhere else
export const moduleRegistry = [
    { id: 'settings', name: 'Settings', module: settingsAtoms },
    { id: 'inventory', name: 'Inventory', module: inventoryAtoms },
    { id: 'activity', name: 'Activity', module: activityAtoms },
    { id: 'last', name: 'Last', module: lastAtoms },
    { id: 'history', name: 'History', module: historyAtoms },
    { id: 'gameLog', name: 'Game Log', module: gameLogAtoms },
    { id: 'items', name: 'Items', module: itemsAtoms }
] as const

export type ModuleType = typeof moduleRegistry[number]['id']

export interface AtomMetadata {
    name: string
    type: AtomType
    atom: any
    module: ModuleType
}

/**
 * Detects atom type by inspecting its internal structure
 * Jotai atoms have read/write/init properties that reveal their pattern
 */
const detectAtomType = (atom: any, name: string): AtomType => {
    // Skip non-atom exports (like atom factories which are functions)
    if (!atom || typeof atom === 'function') {
        return 'state' // Default for non-inspectable exports
    }

    try {
        // Write-only atoms (first param is null, has write function)
        if (atom.write && (!atom.read || atom.init === null)) {
            // Check if async operation
            if (atom.write.constructor?.name === 'AsyncFunction') {
                return 'loading'
            }
            return 'action'
        }

        // Computed atoms (derived, has read function, no init value)
        if (typeof atom.read === 'function' && atom.init === undefined) {
            return 'computed'
        }

        // State atoms (has init value)
        return 'state'
    } catch (error) {
        // Fallback: name-based detection for error cases
        const lowerName = name.toLowerCase()
        if (/^(set|toggle|enable|disable|add|remove|hide|show|start|end|update|delete|clear|trigger|move|rename|confirm|cancel)/.test(lowerName)) {
            return 'action'
        }
        if (/^(initialize|load|reload|fetch|import)/.test(lowerName)) {
            return 'loading'
        }
        return 'state'
    }
}

/**
 * Auto-discover all atoms from a module by looking for exports ending with "Atom"
 * Automatically detects atom type by inspecting structure
 */
const discoverAtoms = (module: any, moduleName: ModuleType): AtomMetadata[] => {
    return Object.entries(module)
        .filter(([name]) => name.endsWith('Atom'))
        .filter(([, value]) => typeof value !== 'function') // Skip atom factories (functions)
        .map(([name, atom]) => ({
            name,
            atom,
            module: moduleName,
            type: detectAtomType(atom, name) // Auto-detect type
        }))
        .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically for consistent display
}

// Auto-discovered registry - derived from moduleRegistry, one source of truth
export const atomRegistry: AtomMetadata[] = moduleRegistry.flatMap(mod =>
    discoverAtoms(mod.module, mod.id)
)

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
