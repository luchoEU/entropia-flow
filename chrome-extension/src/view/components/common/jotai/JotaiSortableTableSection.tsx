import React, { JSX } from 'react'
import { Atom } from 'jotai'
import { JotaiSortableTable } from './JotaiSortableTable'
import { JotaiTableConfig } from './JotaiTableTypes'
import ExpandableSection from '../ExpandableSection'

/**
 * Props for JotaiSortableTableSection component
 * Combines the section header functionality of ExpandableSection with the table from JotaiSortableTable
 */
export interface JotaiSortableTableSectionProps<TItem> {
  // Section properties
  selector: string           // For expandable state persistence
  title: string              // Section title
  subtitle: string           // Section subtitle
  className?: string         // CSS class for the section
  actionRequired?: string    // Action required message
  afterTitle?: JSX.Element   // Custom content in header

  // Table properties (pass through to JotaiSortableTable)
  itemsAtom: Atom<TItem[]>
  config: JotaiTableConfig<TItem>
  afterSearch?: JSX.Element
  beforeTable?: JSX.Element
  children?: React.ReactNode
  itemHeight?: number
  useFixedSizeList?: boolean
  onSortChange?: (columnIndex: number, ascending: boolean) => void
}

/**
 * A modern Jotai-based table component with section header
 * Combines ExpandableSection header with JotaiSortableTable for sorting/filtering
 */
const JotaiSortableTableSectionComponent = function<TItem>(
  props: JotaiSortableTableSectionProps<TItem>
) {
  const {
    selector,
    title,
    subtitle,
    className,
    actionRequired,
    afterTitle,
    itemsAtom,
    config,
    afterSearch,
    beforeTable,
    children,
    itemHeight,
    useFixedSizeList,
    onSortChange
  } = props

  return (
    <ExpandableSection
      selector={selector}
      title={title}
      subtitle={subtitle}
      className={className}
      actionRequired={actionRequired}
      afterTitle={afterTitle}
    >
      <JotaiSortableTable
        itemsAtom={itemsAtom}
        config={config}
        afterSearch={afterSearch}
        beforeTable={beforeTable}
        itemHeight={itemHeight}
        useFixedSizeList={useFixedSizeList}
        onSortChange={onSortChange}
      >
        {children}
      </JotaiSortableTable>
    </ExpandableSection>
  )
}

export const JotaiSortableTableSection = React.memo(
  JotaiSortableTableSectionComponent
) as typeof JotaiSortableTableSectionComponent
