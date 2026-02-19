import React from 'react'
import { CellElement } from './cellDSL'

/**
 * DSL renderer - converts DSL elements to React nodes
 *
 * This module provides the rendering logic for the cell DSL.
 * It traverses the DSL tree and generates React elements.
 */

/**
 * Render a DSL cell element to a React node
 *
 * @param element - The DSL element to render
 * @param item - The data item for this row
 * @param index - The index of this element (used for React keys)
 * @param itemHeight - The height of the table row in pixels
 * @returns React node representing the cell content
 */
export function renderCellElement<TItem>(
  element: CellElement,
  item: TItem,
  index: number,
  itemHeight: number
): React.ReactNode {
  switch (element.type) {
    case 'text': {
      return (
        <span
          key={index}
          style={{
            fontWeight: element.style?.fontWeight,
            color: element.style?.color,
            cursor: element.onClick ? 'pointer' : element.style?.cursor,
            flex: element.style?.flex,
            ...element.style
          }}
          onClick={element.onClick}
          title={element.title}
        >
          {element.value}
        </span>
      )
    }

    case 'icon':
      return (
        <img
          key={index}
          src={element.src}
          alt={element.alt ?? ''}
          title={element.title}
          style={{
            width: element.width,
            height: element.height,
            opacity: element.style?.opacity
          }}
        />
      )

    case 'button': {
      return (
        <img
          key={index}
          src={element.icon}
          title={element.title}
          onClick={(e) => {
            e.stopPropagation()
            element.onClick()
          }}
          {...element.show ? { 'data-show': true } : {}}
          style={{
            cursor: 'pointer',
            width: element.width,
            height: element.height ?? element.width,
            opacity: element.style?.opacity,
            ...element.style
          }}
        />
      )
    }

    case 'textButton': {
      return (
        <button
          key={index}
          onClick={(e) => {
            e.stopPropagation()
            element.onClick()
          }}
          title={element.title}
          style={{
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            ...element.style
          }}
        >
          {element.text}
        </button>
      )
    }

    case 'row':
      return (
        <div
          key={index}
          style={{
            display: 'flex',
            gap: `${element.gap}px`,
            alignItems: element.alignItems ?? 'center',
            flexWrap: element.flexWrap ? 'wrap' : undefined,
            height: itemHeight
          }}
        >
          {element.children.map((child, i) => (
            <React.Fragment key={i}>
              {renderCellElement(child, item, i, itemHeight)}
            </React.Fragment>
          ))}
        </div>
      )

    case 'conditional':
      return element.condition()
        ? renderCellElement(element.then, item, index, itemHeight)
        : element.else
        ? renderCellElement(element.else, item, index, itemHeight)
        : null

    case 'input': {
      if (element.inputType === 'text') {
        return (
          <input
            key={index}
            type="text"
            value={element.value ?? ''}
            onChange={(e) => element.onChange(e.target.value)}
            placeholder={element.placeholder}
            style={{
              width: element.width === 'flex' ? '100%' : `${element.width ?? 100}px`,
              flex: element.width === 'flex' ? 1 : undefined,
              ...element.style
            }}
          />
        )
      } else {
        // file input
        return (
          <input
            key={index}
            type="file"
            accept={element.accept}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                const reader = new FileReader()
                reader.onload = (event) => {
                  element.onChange(event.target?.result as string)
                }
                reader.readAsDataURL(file)
              }
            }}
            style={{
              width: element.width === 'flex' ? '100%' : `${element.width ?? 30}px`,
              ...element.style
            }}
          />
        )
      }
    }

    case 'spacer':
      return (
        <div
          key={index}
          style={{ flex: element.flex ?? 1 }}
        />
      )

    case 'react':
      return (
        <React.Fragment key={index}>
          {element.node}
        </React.Fragment>
      )

    default:
      // TypeScript exhaustiveness check - should never reach here
      const _exhaustiveCheck: never = element
      return null
  }
}
