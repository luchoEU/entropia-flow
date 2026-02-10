import React from 'react'
import { useSetAtom, useAtomValue } from 'jotai'
import { StreamChooserLine, StreamTrashLine } from '../atoms/streamTables'
import { StreamComputedVariable } from '../../../stream/data'
import { JotaiTableConfig } from '../../components/common/jotai/JotaiTableTypes'
import { useNavigate } from 'react-router-dom'
import { TabId } from '../state/navigation'
import {
  setStreamStaredAtom,
  removeStreamLayoutAtom,
  setStreamUserPartialAtom,
  removeStreamUserAtom,
  restoreStreamLayoutAtom
} from '../atoms/stream'
import StreamViewLayout from '../../components/stream/StreamViewLayout'
import { streamStateAtom } from '../atoms/stream'
import ImgButton from '../../components/common/ImgButton'

/**
 * Stream Table Configurations
 * Jotai-based table configs for stream-related tables
 */

/**
 * Stream Chooser Table Config
 * Shows available stream layouts with preview and actions
 */
export const streamChooserConfig: JotaiTableConfig<StreamChooserLine> = {
  title: 'Layouts',
  columns: [
    {
      id: 'name',
      header: 'Name',
      sortAccessor: (item) => item.name,
      filterAccessor: (item) => item.name,
      renderRow: (item) => {
        const setStared = useSetAtom(setStreamStaredAtom)
        const removeLayout = useSetAtom(removeStreamLayoutAtom)
        const navigate = useNavigate()

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
            <span>{item.name}</span>
            <div style={{ flex: 1 }} />
            <ImgButton
              title="Set as default"
              src={item.stared ? 'img/staron.png' : 'img/staroff.png'}
              dispatch={() => setStared(item.id, !item.stared)}
            />
            <ImgButton
              title="Edit layout"
              src="img/edit.png"
              dispatch={() => navigate(`${TabId.STREAM}/layout/${item.id}`)}
            />
            {!item.readonly && (
              <ImgButton
                title="Remove layout"
                src="img/cross.png"
                dispatch={() => removeLayout(item.id)}
              />
            )}
          </div>
        )
      }
    },
    {
      id: 'preview',
      header: 'Preview',
      renderRow: (item) => {
        const streamState = useAtomValue(streamStateAtom)
        const { commonData = {}, layoutData = {} } = streamState.out?.data ?? {}
        return (
          <StreamViewLayout
            single={{ data: { ...commonData, ...layoutData[item.id] }, layout: item.layout }}
            layoutId={item.id}
            id={`stream-chooser-${item.id}`}
            scale={0.4}
          />
        )
      }
    }
  ]
}

/**
 * Stream Trash Table Config
 * Shows deleted stream layouts that can be restored
 */
export const streamTrashConfig: JotaiTableConfig<StreamTrashLine> = {
  title: 'Trash',
  columns: [
    {
      id: 'name',
      header: 'Name',
      sortAccessor: (item) => item.name,
      filterAccessor: (item) => item.name,
      renderRow: (item) => {
        const restore = useSetAtom(restoreStreamLayoutAtom)

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
            <span>{item.name}</span>
            <div style={{ flex: 1 }} />
            <ImgButton
              title="Restore layout"
              src="img/recycle.png"
              dispatch={() => restore(item.id)}
            />
          </div>
        )
      }
    },
    {
      id: 'preview',
      header: 'Preview',
      renderRow: (item) => {
        const streamState = useAtomValue(streamStateAtom)
        const { commonData = {}, layoutData = {} } = streamState.out?.data ?? {}
        return (
          <StreamViewLayout
            single={{ data: { ...commonData, ...layoutData[item.id] }, layout: item.layout }}
            layoutId={item.id}
            id={`stream-trash-${item.id}`}
            scale={0.4}
          />
        )
      }
    }
  ]
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
      renderRow: (item) => <span>{item.source}</span>
    },
    {
      id: 'name',
      header: 'Name',
      sortAccessor: (item) => item.name,
      filterAccessor: (item) => item.name,
      renderRow: (item) => <span>{item.name}</span>
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
      renderRow: (item) => {
        const value = item.computed && typeof item.computed === 'string' ? item.computed : JSON.stringify(item.computed ?? item.value)
        const isFormula = typeof item.value === 'string' && item.value.startsWith('=')

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ImgButton
              title="Copy value to clipboard"
              src="img/copy.png"
              dispatch={() => {
                navigator.clipboard.writeText(value)
              }}
            />
            <span title={isFormula && typeof item.value === 'string' ? item.value : undefined}>{value}</span>
          </div>
        )
      }
    },
    {
      id: 'description',
      header: 'Description',
      sortAccessor: (item) => item.description ?? '',
      filterAccessor: (item) => item.description ?? '',
      renderRow: (item) => <span>{item.description ?? ''}</span>
    }
  ]
}

/**
 * Stream Images Table Config
 * Shows available images for use in templates with edit capability
 */
export const streamImagesConfig: JotaiTableConfig<StreamComputedVariable> = {
  title: 'Images',
  columns: [
    {
      id: 'source',
      header: 'Source',
      sortAccessor: (item) => item.source,
      filterAccessor: (item) => item.source,
      renderRow: (item) => <span>{item.source}</span>
    },
    {
      id: 'name',
      header: 'Name',
      sortAccessor: (item) => item.name,
      filterAccessor: (item) => item.name,
      renderRow: (item) => {
        const setUserPartial = useSetAtom(setStreamUserPartialAtom)
        const removeUser = useSetAtom(removeStreamUserAtom)
        const streamState = useAtomValue(streamStateAtom)

        if (item.source === 'layout') {
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input
                type="text"
                value={item.name}
                onChange={(e) => {
                  const layoutId = streamState.ui.showingLayoutId ?? ''
                  setUserPartial(layoutId, item.id!, { name: e.target.value })
                }}
                style={{ flex: 1, padding: '2px' }}
              />
              <ImgButton
                title="Remove variable"
                src="img/cross.png"
                dispatch={() => {
                  const layoutId = streamState.ui.showingLayoutId ?? ''
                  removeUser(layoutId, item.id!)
                }}
              />
            </div>
          )
        }
        return <span>{item.name}</span>
      }
    },
    {
      id: 'image',
      header: 'Image',
      renderRow: (item) => {
        const streamState = useAtomValue(streamStateAtom)
        const setUserPartial = useSetAtom(setStreamUserPartialAtom)

        const img = (
          <img
            src={item.value as string}
            title={`${item.name} image`}
            style={{ height: '50px', objectFit: 'contain', maxWidth: '100%' }}
          />
        )

        if (item.source === 'layout') {
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {img}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = (event) => {
                      const layoutId = streamState.ui.showingLayoutId ?? ''
                      setUserPartial(layoutId, item.id!, { value: event.target?.result as string })
                    }
                    reader.readAsDataURL(file)
                  }
                }}
                style={{ width: '30px' }}
              />
            </div>
          )
        }
        return img
      }
    },
    {
      id: 'description',
      header: 'Description',
      sortAccessor: (item) => item.description ?? '',
      filterAccessor: (item) => item.description ?? '',
      renderRow: (item) => {
        const setUserPartial = useSetAtom(setStreamUserPartialAtom)
        const streamState = useAtomValue(streamStateAtom)

        return (
          <input
            type="text"
            value={item.description ?? ''}
            onChange={(e) => {
              const layoutId = streamState.ui.showingLayoutId ?? ''
              setUserPartial(layoutId, item.id!, { description: e.target.value })
            }}
            style={{ width: '100%', padding: '2px' }}
          />
        )
      }
    }
  ]
}

/**
 * Stream Parameters Table Config
 * Shows parameters available for the layout
 */
export const streamParametersConfig: JotaiTableConfig<StreamComputedVariable> = {
  title: 'Parameters',
  columns: [
    {
      id: 'name',
      header: 'Name',
      sortAccessor: (item) => item.name,
      filterAccessor: (item) => item.name,
      renderRow: (item) => {
        const setUserPartial = useSetAtom(setStreamUserPartialAtom)
        const removeUser = useSetAtom(removeStreamUserAtom)
        const streamState = useAtomValue(streamStateAtom)

        if (item.source === 'layout') {
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input
                type="text"
                value={item.name}
                onChange={(e) => {
                  const layoutId = streamState.ui.showingLayoutId ?? ''
                  setUserPartial(layoutId, item.id!, { name: e.target.value })
                }}
                style={{ flex: 1, padding: '2px' }}
              />
              <ImgButton
                title="Remove parameter"
                src="img/cross.png"
                dispatch={() => {
                  const layoutId = streamState.ui.showingLayoutId ?? ''
                  removeUser(layoutId, item.id!)
                }}
              />
            </div>
          )
        }
        return <span>{item.name}</span>
      }
    },
    {
      id: 'value',
      header: 'Value',
      sortAccessor: (item) => JSON.stringify(item.value),
      filterAccessor: (item) => JSON.stringify(item.value),
      renderRow: (item) => {
        const setUserPartial = useSetAtom(setStreamUserPartialAtom)
        const streamState = useAtomValue(streamStateAtom)

        if (item.source === 'layout') {
          return (
            <input
              type="text"
              value={typeof item.value === 'string' ? item.value : JSON.stringify(item.value)}
              onChange={(e) => {
                const layoutId = streamState.ui.showingLayoutId ?? ''
                setUserPartial(layoutId, item.id!, { value: e.target.value })
              }}
              style={{ width: '100%', padding: '2px' }}
            />
          )
        }
        return <span>{typeof item.value === 'string' ? item.value : JSON.stringify(item.value)}</span>
      }
    },
    {
      id: 'description',
      header: 'Description',
      sortAccessor: (item) => item.description ?? '',
      filterAccessor: (item) => item.description ?? '',
      renderRow: (item) => {
        const setUserPartial = useSetAtom(setStreamUserPartialAtom)
        const streamState = useAtomValue(streamStateAtom)

        return (
          <input
            type="text"
            value={item.description ?? ''}
            onChange={(e) => {
              const layoutId = streamState.ui.showingLayoutId ?? ''
              setUserPartial(layoutId, item.id!, { description: e.target.value })
            }}
            style={{ width: '100%', padding: '2px' }}
          />
        )
      }
    }
  ]
}
