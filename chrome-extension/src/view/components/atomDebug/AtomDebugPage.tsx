import React from 'react'
import { useAtom } from 'jotai'
import { atomRegistry, getAtomsByModule, getModules, ModuleType } from '../../application/atoms/atomRegistry'
import { debugPageUiAtom } from '../../application/atoms/debug'
import AtomModuleSection from './AtomModuleSection'

const MODULES = getModules()

const AtomDebugPage: React.FC = () => {
    const [debugPageUi, setDebugPageUi] = useAtom(debugPageUiAtom)
    const { searchQuery, selectedModule } = debugPageUi

    const moduleAtoms = MODULES.reduce((acc, mod) => {
        acc[mod.id] = getAtomsByModule(mod.id)
        return acc
    }, {} as Record<ModuleType, any[]>)

    // Filter by search query
    const filterAtoms = (atoms: any[]) => {
        if (!searchQuery.trim()) return atoms
        const query = searchQuery.toLowerCase()
        return atoms.filter(a =>
            a.name.toLowerCase().includes(query)
        )
    }

    const filteredModuleAtoms = MODULES.reduce((acc, mod) => {
        acc[mod.id] = filterAtoms(moduleAtoms[mod.id])
        return acc
    }, {} as Record<ModuleType, any[]>)

    const shouldShowModule = (module: string) => {
        return selectedModule === 'all' || selectedModule === module
    }

    const totalMatches = MODULES.reduce((sum, mod) => sum + filteredModuleAtoms[mod.id].length, 0)

    return (
        <section style={{ padding: '16px' }}>
            {/* Header */}
            <div style={{ marginBottom: '20px' }}>
                <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 600 }}>Atom Debug</h1>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                    Real-time view of all {atomRegistry.length} Jotai atoms in the application
                </p>
            </div>

            {/* Controls */}
            <div style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '20px',
                padding: '12px 16px',
                backgroundColor: '#f6f8fa',
                borderRadius: '6px',
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>
                {/* Search */}
                <input
                    type="text"
                    placeholder="Search atoms by name..."
                    value={searchQuery}
                    onChange={(e) => setDebugPageUi({ ...debugPageUi, searchQuery: e.target.value })}
                    style={{
                        flex: '1 1 auto',
                        minWidth: '200px',
                        padding: '8px 12px',
                        border: '1px solid #e1e4e8',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box'
                    }}
                />

                {/* Module filter */}
                <select
                    value={selectedModule}
                    onChange={(e) => setDebugPageUi({ ...debugPageUi, selectedModule: e.target.value as any })}
                    style={{
                        padding: '8px 12px',
                        border: '1px solid #e1e4e8',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor: '#fff',
                        fontFamily: 'inherit',
                        cursor: 'pointer'
                    }}
                >
                    <option value="all">All Modules ({atomRegistry.length})</option>
                    {MODULES.map(mod => (
                        <option key={mod.id} value={mod.id}>
                            {mod.name} ({moduleAtoms[mod.id].length})
                        </option>
                    ))}
                </select>
            </div>

            {/* Summary Stats */}
            {!searchQuery && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '12px',
                    marginBottom: '20px'
                }}>                   
                </div>
            )}

            {/* Search Results Info */}
            {searchQuery && (
                <div style={{
                    padding: '12px 16px',
                    backgroundColor: '#e7f2ff',
                    border: '1px solid #0366d6',
                    borderRadius: '6px',
                    marginBottom: '20px',
                    fontSize: '13px',
                    color: '#0366d6'
                }}>
                    Found <strong>{totalMatches}</strong> atom{totalMatches !== 1 ? 's' : ''} matching "{searchQuery}"
                </div>
            )}

            {/* Atom Modules */}
            {totalMatches > 0 ? (
                <>
                    {MODULES.map(mod =>
                        shouldShowModule(mod.id) && filteredModuleAtoms[mod.id].length > 0 && (
                            <AtomModuleSection
                                key={mod.id}
                                moduleName={mod.name}
                                atoms={filteredModuleAtoms[mod.id]}
                            />
                        )
                    )}
                </>
            ) : (
                <div style={{
                    padding: '40px 32px',
                    textAlign: 'center',
                    color: '#666',
                    backgroundColor: '#f6f8fa',
                    borderRadius: '6px'
                }}>
                    {searchQuery ? (
                        <>
                            <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                                No atoms match "<strong>{searchQuery}</strong>"
                            </p>
                            <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
                                Try a different search term
                            </p>
                        </>
                    ) : (
                        <p style={{ margin: 0, fontSize: '14px' }}>
                            No atoms available for selected module
                        </p>
                    )}
                </div>
            )}
        </section>
    )
}

export default AtomDebugPage
