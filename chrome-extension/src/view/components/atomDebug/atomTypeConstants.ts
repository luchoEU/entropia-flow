import { AtomType } from '../../application/atoms/atomRegistry'

export const typeLabels: Record<AtomType, string> = {
    state: 'State Atoms',
    computed: 'Computed Atoms',
    action: 'Action Atoms',
    loading: 'Loading Atoms'
}

export const typeDescriptions: Record<AtomType, string> = {
    state: 'Writable atoms that hold application state',
    computed: 'Derived read-only atoms computed from other atoms',
    action: 'Write-only atoms that perform actions',
    loading: 'Boolean atoms tracking loading states'
}

export const typeColors: Record<AtomType, string> = {
    state: '#0366d6',
    computed: '#28a745',
    action: '#ffc107',
    loading: '#6f42c1'
}

export const typeEmojis: Record<AtomType, string> = {
    state: '⚙️',
    computed: '📊',
    action: '⚡',
    loading: '⏳'
}
