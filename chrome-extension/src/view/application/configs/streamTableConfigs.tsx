import { StreamChooserLine, StreamTrashLine } from '../atoms/streamTables'
import { StreamComputedVariable } from '../../../stream/data'
import { JotaiTableConfig } from '../../components/common/jotai/JotaiTableTypes'
import { CellElement } from '../../components/common/jotai/cellDSL'

/**
 * Stream Table Configurations
 * DSL-based table configs for stream-related tables
 *
 * These are factory functions that accept handlers/atoms to enable
 * state management without React hooks inside renderRow functions
 */

/**
 * Stream Chooser Table Config Factory
 * Shows available stream layouts with preview and actions
 */
export interface StreamChooserHandlers {
  setStared: (id: string, value: boolean) => void
  removeLayout: (id: string) => void
  navigate: (path: string) => void
  renderPreview: (item: StreamChooserLine) => React.ReactNode
}

export function createStreamChooserConfig(
  handlers: StreamChooserHandlers
): JotaiTableConfig<StreamChooserLine> {
  return {
    title: 'Layouts',
    columns: [
      {
        id: 'name',
        header: 'Name',
        sortAccessor: (item) => item.name,
        filterAccessor: (item) => item.name,
        renderRow: (item): CellElement => ({
          type: 'row',
          gap: 4,
          children: [
            { type: 'text', value: item.name },
            { type: 'spacer' },
            {
              type: 'button',
              icon: item.stared ? 'img/staron.png' : 'img/staroff.png',
              width: 16,
              height: 16,
              title: 'Set as default',
              onClick: () => handlers.setStared(item.id, !item.stared)
            },
            {
              type: 'button',
              icon: 'img/edit.png',
              width: 16,
              height: 16,
              title: 'Edit layout',
              onClick: () => handlers.navigate(`/stream/layout/${item.id}`)
            },
            ...(item.readonly ? [] : [{
              type: 'button' as const,
              icon: 'img/cross.png',
              width: 16,
              height: 16,
              title: 'Remove layout',
              onClick: () => handlers.removeLayout(item.id)
            }])
          ]
        })
      },
      {
        id: 'preview',
        header: 'Preview',
        renderRow: (item): CellElement => ({
          type: 'react',
          node: handlers.renderPreview(item),
          width: 200
        })
      }
    ]
  }
}

/**
 * Stream Trash Table Config Factory
 * Shows deleted stream layouts that can be restored
 */
export interface StreamTrashHandlers {
  restore: (id: string) => void
}

export function createStreamTrashConfig(
  handlers: StreamTrashHandlers
): JotaiTableConfig<StreamTrashLine> {
  return {
    title: 'Trash',
    columns: [
      {
        id: 'name',
        header: 'Name',
        sortAccessor: (item) => item.name,
        filterAccessor: (item) => item.name,
        renderRow: (item): CellElement => ({
          type: 'row',
          gap: 4,
          children: [
            { type: 'text', value: item.name },
            { type: 'spacer' },
            {
              type: 'button',
              icon: 'img/recycle.png',
              width: 16,
              height: 16,
              title: 'Restore layout',
              onClick: () => handlers.restore(item.id)
            }
          ]
        })
      }
    ]
  }
}

/**
 * Stream Variables Table Config
 * Shows computed variables available for use in templates
 */
export const streamVariablesConfig: JotaiTableConfig<StreamComputedVariable> = {
  title: 'Variables',
  columns: [
    {
      id: 'source',
      header: 'Source',
      sortAccessor: (item) => item.source,
      filterAccessor: (item) => item.source,
      renderRow: (item): CellElement => ({
        type: 'text',
        value: item.source
      })
    },
    {
      id: 'name',
      header: 'Name',
      sortAccessor: (item) => item.name,
      filterAccessor: (item) => item.name,
      renderRow: (item): CellElement => ({
        type: 'text',
        value: item.name
      })
    },
    {
      id: 'value',
      header: 'Value',
      sortAccessor: (item) => {
        const value = item.computed && typeof item.computed === 'string' ? item.computed : JSON.stringify(item.computed ?? item.value)
        return value
      },
      filterAccessor: (item) => {
        const value = item.computed && typeof item.computed === 'string' ? item.computed : JSON.stringify(item.computed ?? item.value)
        return value
      },
      renderRow: (item): CellElement => {
        const value = item.computed && typeof item.computed === 'string' ? item.computed : JSON.stringify(item.computed ?? item.value)
        const isFormula = typeof item.value === 'string' && item.value.startsWith('=')

        return {
          type: 'row',
          gap: 4,
          children: [
            {
              type: 'button',
              icon: 'img/copy.png',
              width: 16,
              height: 16,
              title: 'Copy value to clipboard',
              onClick: () => navigator.clipboard.writeText(value)
            },
            {
              type: 'text',
              value: value,
              title: isFormula && typeof item.value === 'string' ? item.value : undefined
            }
          ]
        }
      }
    },
    {
      id: 'description',
      header: 'Description',
      sortAccessor: (item) => item.description ?? '',
      filterAccessor: (item) => item.description ?? '',
      renderRow: (item): CellElement => ({
        type: 'text',
        value: item.description ?? ''
      })
    }
  ]
}

/**
 * Stream Images Table Config Factory
 * Shows available images for use in templates with edit capability
 */
export interface StreamImagesHandlers {
  setUserPartial: (layoutId: string, itemId: number, partial: any) => void
  removeUser: (layoutId: string, itemId: number) => void
  getLayoutId: () => string
}

export function createStreamImagesConfig(
  handlers: StreamImagesHandlers
): JotaiTableConfig<StreamComputedVariable> {
  return {
    title: 'Images',
    columns: [
      {
        id: 'source',
        header: 'Source',
        sortAccessor: (item) => item.source,
        filterAccessor: (item) => item.source,
        renderRow: (item): CellElement => ({
          type: 'text',
          value: item.source
        })
      },
      {
        id: 'name',
        header: 'Name',
        sortAccessor: (item) => item.name,
        filterAccessor: (item) => item.name,
        renderRow: (item): CellElement => {
          if (item.source === 'layout') {
            return {
              type: 'row',
              gap: 4,
              children: [
                {
                  type: 'input',
                  inputType: 'text',
                  value: item.name,
                  width: 'flex',
                  onChange: (value) => {
                    const layoutId = handlers.getLayoutId()
                    handlers.setUserPartial(layoutId, item.id!, { name: value })
                  }
                },
                {
                  type: 'button',
                  icon: 'img/cross.png',
                  width: 16,
                  height: 16,
                  title: 'Remove image',
                  onClick: () => {
                    const layoutId = handlers.getLayoutId()
                    handlers.removeUser(layoutId, item.id!)
                  }
                }
              ]
            }
          }
          return { type: 'text', value: item.name }
        }
      },
      {
        id: 'image',
        header: 'Image',
        renderRow: (item): CellElement => {
          if (item.source === 'layout') {
            return {
              type: 'row',
              gap: 4,
              children: [
                { type: 'icon', src: item.value as string, width: 50, height: 50, title: `${item.name} image` },
                {
                  type: 'input',
                  inputType: 'file',
                  accept: 'image/*',
                  width: 30,
                  onChange: (dataUrl) => {
                    const layoutId = handlers.getLayoutId()
                    handlers.setUserPartial(layoutId, item.id!, { value: dataUrl })
                  }
                }
              ]
            }
          }
          return { type: 'icon', src: item.value as string, width: 50, height: 50, title: `${item.name} image` }
        }
      },
      {
        id: 'description',
        header: 'Description',
        sortAccessor: (item) => item.description ?? '',
        filterAccessor: (item) => item.description ?? '',
        renderRow: (item): CellElement => ({
          type: 'input',
          inputType: 'text',
          value: item.description ?? '',
          width: 'flex',
          onChange: (value) => {
            const layoutId = handlers.getLayoutId()
            handlers.setUserPartial(layoutId, item.id!, { description: value })
          }
        })
      }
    ]
  }
}

/**
 * Stream Parameters Table Config Factory
 * Shows parameters available for the layout
 */
export interface StreamParametersHandlers {
  setUserPartial: (layoutId: string, itemId: number, partial: any) => void
  removeUser: (layoutId: string, itemId: number) => void
  getLayoutId: () => string
}

export function createStreamParametersConfig(
  handlers: StreamParametersHandlers
): JotaiTableConfig<StreamComputedVariable> {
  return {
    title: 'Parameters',
    columns: [
      {
        id: 'name',
        header: 'Name',
        sortAccessor: (item) => item.name,
        filterAccessor: (item) => item.name,
        renderRow: (item): CellElement => {
          if (item.source === 'layout') {
            return {
              type: 'row',
              gap: 4,
              children: [
                {
                  type: 'input',
                  inputType: 'text',
                  value: item.name,
                  width: 'flex',
                  onChange: (value) => {
                    const layoutId = handlers.getLayoutId()
                    handlers.setUserPartial(layoutId, item.id!, { name: value })
                  }
                },
                {
                  type: 'button',
                  icon: 'img/cross.png',
                  width: 16,
                  height: 16,
                  title: 'Remove parameter',
                  onClick: () => {
                    const layoutId = handlers.getLayoutId()
                    handlers.removeUser(layoutId, item.id!)
                  }
                }
              ]
            }
          }
          return { type: 'text', value: item.name }
        }
      },
      {
        id: 'value',
        header: 'Value',
        sortAccessor: (item) => JSON.stringify(item.value),
        filterAccessor: (item) => JSON.stringify(item.value),
        renderRow: (item): CellElement => {
          const displayValue = typeof item.value === 'string' ? item.value : JSON.stringify(item.value)

          if (item.source === 'layout') {
            return {
              type: 'input',
              inputType: 'text',
              value: displayValue,
              width: 'flex',
              onChange: (value) => {
                const layoutId = handlers.getLayoutId()
                handlers.setUserPartial(layoutId, item.id!, { value })
              }
            }
          }
          return { type: 'text', value: displayValue }
        }
      },
      {
        id: 'description',
        header: 'Description',
        sortAccessor: (item) => item.description ?? '',
        filterAccessor: (item) => item.description ?? '',
        renderRow: (item): CellElement => ({
          type: 'input',
          inputType: 'text',
          value: item.description ?? '',
          width: 'flex',
          onChange: (value) => {
            const layoutId = handlers.getLayoutId()
            handlers.setUserPartial(layoutId, item.id!, { description: value })
          }
        })
      }
    ]
  }
}
