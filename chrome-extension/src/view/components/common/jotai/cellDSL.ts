import React from 'react'

/**
 * DSL (Domain Specific Language) for table cell rendering
 *
 * This module defines a declarative DSL for defining table cell content.
 * Instead of writing React components, you define a data structure that
 * describes the cell content. This enables:
 * - Automatic width calculation without DOM measurement
 * - Purely presentational cells (business logic stays in atoms/callbacks)
 * - Type-safe, testable column definitions
 */

/**
 * Union type of all possible cell elements
 */
export type CellElement =
  | TextElement
  | IconElement
  | ButtonElement
  | TextButtonElement
  | RowElement
  | ConditionalElement
  | InputElement
  | SpacerElement
  | ReactElement

/**
 * Text element - displays a text
 */
export interface TextElement {
  type: 'text'
  /** The text to display */
  value: string
  /** Optional styles for the text */
  style?: {
    fontWeight?: 'normal' | 'bold'
    color?: string
    cursor?: string
    flex?: number
  }
  /** Optional click handler */
  onClick?: () => void
  /** Optional title/tooltip */
  title?: string
}

/**
 * Icon element - displays an image
 */
export interface IconElement {
  type: 'icon'
  /** Path to the icon image */
  src: string
  /** Icon width in pixels */
  width: number
  /** Icon height in pixels */
  height: number
  /** Optional alt text */
  alt?: string
  /** Optional title/tooltip */
  title?: string
  /** Optional styles */
  style?: {
    opacity?: number
  }
}

/**
 * Button element - clickable icon button
 */
export interface ButtonElement {
  type: 'button'
  /** Icon path */
  icon: string
  /** Always visible */
  show?: boolean
  /** Button width in pixels */
  width: number
  /** Button height in pixels (defaults to width if not specified) */
  height?: number
  /** Click handler */
  onClick: () => void
  /** Title/tooltip */
  title: string
  /** Optional styles */
  style?: {
    opacity?: number
    cursor?: string
  }
}

/**
 * Text button element - clickable button with text content
 * Useful for error buttons, action links, etc.
 */
export interface TextButtonElement {
  type: 'textButton'
  /** Button text */
  text: string
  /** Click handler */
  onClick: () => void
  /** Optional title/tooltip */
  title?: string
  /** Optional styles */
  style?: React.CSSProperties
  /** Estimated width for measurement (since text buttons can have variable width) */
  estimatedWidth?: number
}

/**
 * Row element - horizontal flex container
 * Used to layout multiple elements in a row with gaps
 */
export interface RowElement {
  type: 'row'
  /** Child elements to display in the row */
  children: CellElement[]
  /** Gap between children in pixels */
  gap: number
  /** Vertical alignment of children (default: 'center') */
  alignItems?: 'center' | 'start' | 'end'
  /** Whether to wrap children (default: false) */
  flexWrap?: boolean
}

/**
 * Conditional element - if/else rendering
 * Useful for loading states, error states, etc.
 */
export interface ConditionalElement {
  type: 'conditional'
  /** Condition to evaluate */
  condition: () => boolean
  /** Element to render if condition is true */
  then: CellElement
  /** Optional element to render if condition is false */
  else?: CellElement
}

/**
 * Input element - text or file input field
 */
export interface InputElement {
  type: 'input'
  /** Type of input */
  inputType: 'text' | 'file'
  /** Current value */
  value?: string
  /** Change handler - receives new value */
  onChange: (value: string) => void
  /** Placeholder text */
  placeholder?: string
  /** Accept attribute (for file inputs, e.g., "image/*") */
  accept?: string
  /** Width in pixels or 'flex' for flex: 1 */
  width?: number | 'flex'
  /** Optional styles */
  style?: React.CSSProperties
}

/**
 * Spacer element - flexible space that pushes adjacent elements apart
 * Useful for right-aligning buttons, etc.
 */
export interface SpacerElement {
  type: 'spacer'
  /** Flex grow value (default: 1) */
  flex?: number
}

/**
 * React element - wraps arbitrary React components for display in cells
 * Use when you need to render a React component that can't be expressed in the DSL
 * Note: width must be specified explicitly since React content can't be auto-measured
 */
export interface ReactElement {
  type: 'react'
  /** The React node to render */
  node: React.ReactNode
  /** Width in pixels — required since React content cannot be auto-measured */
  width: number
}
