import React, { useState } from 'react'
import { useAtomValue } from 'jotai'
import { pinnedAtomListAtom } from '../../application/atoms/debug'
import ExpandableSection from '../common/ExpandableSection'
import AtomValueDisplay from './AtomValueDisplay'

const PinnedAtomsView: React.FC = () => {
  const pinnedList = useAtomValue(pinnedAtomListAtom)
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())

  const toggleExpand = (keyPath: string) => {
    const newSet = new Set(expandedKeys)
    if (newSet.has(keyPath)) {
      newSet.delete(keyPath)
    } else {
      newSet.add(keyPath)
    }
    setExpandedKeys(newSet)
  }

  // Don't render if no atoms are pinned
  if (pinnedList.length === 0) {
    return null
  }

  return (
    <ExpandableSection
      selector="pinned-atoms-view"
      title=""
      subtitle={`Pinned Atoms (${pinnedList.length})`}
      hideExpandableArrow={false}
      className="pinned-atoms-section"
      afterTitle={undefined}
    >
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#f6f8fa',
        borderRadius: '6px'
      }}>
        {pinnedList.map(atomMeta => (
          <AtomValueDisplay
            key={atomMeta.name}
            atomName={atomMeta.name}
            atom={atomMeta.atom}
            atomType={atomMeta.type}
            expandedKeys={expandedKeys}
            onToggleExpand={toggleExpand}
          />
        ))}
      </div>
    </ExpandableSection>
  )
}

export default PinnedAtomsView
