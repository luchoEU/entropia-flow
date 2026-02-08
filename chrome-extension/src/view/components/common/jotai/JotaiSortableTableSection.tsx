import React, { JSX } from 'react'
import { Atom } from 'jotai'
import { JotaiSortableTable } from './JotaiSortableTable'
import { JotaiSortableTableProps, JotaiTableConfig } from './JotaiTableTypes'
import ExpandableSection from '../ExpandableSection'

/**
 * Props for JotaiSortableTableSection component
 * Combines the section header functionality of ExpandableSection with the table from JotaiSortableTable
 */
export type JotaiSortableTableSectionProps<TItem> = {
  // Section properties
  selector: string           // For expandable state persistence
  title: string              // Section title
  subtitle: string           // Section subtitle
  className?: string         // CSS class for the section
  actionRequired?: string    // Action required message
  afterTitle?: JSX.Element   // Custom content in header
} & JotaiSortableTableProps<TItem>

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
    ...tableProps
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
      <JotaiSortableTable {...tableProps}>
        {tableProps.children}
      </JotaiSortableTable>
    </ExpandableSection>
  )
}

export const JotaiSortableTableSection = React.memo(
  JotaiSortableTableSectionComponent
) as typeof JotaiSortableTableSectionComponent
