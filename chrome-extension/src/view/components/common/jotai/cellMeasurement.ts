import { CellElement } from './cellDSL'

/**
 * Canvas-based text measurement for calculating column widths
 *
 * This module provides utilities to calculate the width of DSL elements
 * without rendering them to the DOM. It uses a singleton canvas element
 * for text measurement and traverses the DSL tree to sum up widths.
 */

// Singleton canvas for text measurement
let measurementCanvas: HTMLCanvasElement | null = null

/**
 * Get or create the singleton canvas for text measurement
 */
function getCanvas(): HTMLCanvasElement {
  if (!measurementCanvas) {
    measurementCanvas = document.createElement('canvas')
  }
  return measurementCanvas
}

/**
 * Measure the width of text using canvas API
 * @param text - The text to measure
 * @param font - CSS font string (e.g., '13px Arial', 'bold 13px Arial')
 * @returns Width in pixels (ceiled to integer)
 */
export function measureTextWidth(
  text: string,
  font: string = '13px Arial'
): number {
  const canvas = getCanvas()
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    // Fallback estimate if canvas context not available
    return text.length * 8
  }

  ctx.font = font
  const metrics = ctx.measureText(text)
  return Math.ceil(metrics.width)
}

/**
 * Calculate the width of a single cell element
 * @param element - The DSL element to measure
 * @param sampleItem - A sample item to evaluate dynamic values
 * @param font - Optional CSS font string (default: '13px Arial')
 * @returns Width in pixels
 */
export function calculateCellWidth<TItem>(
  element: CellElement<TItem>,
  sampleItem: TItem,
  font?: string
): number {
  switch (element.type) {
    case 'text': {
      // Adjust font for bold text
      const actualFont = element.style?.fontWeight === 'bold'
        ? font?.replace('13px', 'bold 13px') ?? 'bold 13px Arial'
        : font ?? '13px Arial'

      return measureTextWidth(element.value, actualFont)
    }

    case 'icon':
      return element.width

    case 'button':
      return element.width

    case 'textButton': {
      // If estimated width is provided, use it
      if (element.estimatedWidth !== undefined) {
        return element.estimatedWidth
      }

      // Otherwise measure the text
      // Add padding for button (approximate)
      return measureTextWidth(element.text, font ?? '13px Arial') + 20
    }

    case 'row': {
      const childWidths = element.children
        .map(child => calculateCellWidth(child, sampleItem, font))

      // Sum children widths + gaps between them
      return childWidths.reduce((sum, w) => sum + w, 0)
        + element.gap * (element.children.length - 1)
    }

    case 'conditional': {
      const thenWidth = calculateCellWidth(element.then, sampleItem, font)
      const elseWidth = element.else
        ? calculateCellWidth(element.else, sampleItem, font)
        : 0

      // Return maximum width of both branches
      return Math.max(thenWidth, elseWidth)
    }

    case 'input': {
      return typeof element.width === 'number' ? element.width : 100
    }

    case 'spacer':
      // Spacers don't contribute to minimum width
      return 0

    default:
      // TypeScript exhaustiveness check - should never reach here
      const _exhaustiveCheck: never = element
      return 0
  }
}

/**
 * Calculate the width for a column by sampling multiple items
 *
 * This function samples the first N items and calculates the width for each,
 * then returns the maximum width. This handles variable-width content
 * (e.g., different length names) better than using a single item.
 *
 * @param renderRow - Function that transforms item to DSL element
 * @param items - Array of items to sample from
 * @param sampleSize - Number of items to sample (default: 10)
 * @param font - Optional CSS font string (default: '13px Arial')
 * @returns Maximum width in pixels (minimum 60px)
 */
export function calculateColumnWidth<TItem>(
  renderRow: (item: TItem) => CellElement<TItem>,
  items: TItem[],
  sampleSize: number = 10,
  font?: string
): number {
  if (items.length === 0) {
    return 60 // minimum width when no items
  }

  // Sample first N items
  const samples = items.slice(0, Math.min(items.length, sampleSize))
  const widths = samples.map(item => {
    const element = renderRow(item)
    return calculateCellWidth(element, item, font)
  })

  // Return max width from samples, but at least 60px
  return Math.max(...widths, 60)
}
