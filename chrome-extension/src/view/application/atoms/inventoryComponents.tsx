import React, { useEffect, useState } from 'react'
import { useSetAtom, useAtomValue } from 'jotai'
import { ItemOwned, TradeBlueprintLineData } from '../state/inventory'
import { JotaiTableConfig } from '../../components/common/jotai/JotaiTableTypes'
import { TTServiceSheetItem } from '../state/ttService'
import { useNavigate } from 'react-router-dom'
import {
  hideCriteriaAtom,
  filterOptionsAtom,
  tradeItemChainAtom
} from './inventory'
import { craftBlueprintUrl, navigateTo } from '../actions/navigation'
import { loadCraftBlueprintAtom, setBlueprintStaredAtom } from './craft'

/**
 * Switch button for filter options
 */
const SwitchButton: React.FC<{
  label: string
  title: string
  enabled: boolean
  onClick: () => void
}> = ({ label, title, enabled, onClick }) => (
  <button
    className={`button-option-switch ${enabled ? 'active' : ''}`}
    title={`${title} ${enabled ? '[ON]' : '[OFF]'}, click to ${enabled ? 'dis' : 'en'}able it`}
    onClick={onClick}
  >
    {label}
  </button>
)

/**
 * After search controls for showing/hiding filtered items
 */
export const InventoryOwnedListAfterSearch: React.FC = () => {
  const c = useAtomValue(hideCriteriaAtom)
  const setHideCriteria = useSetAtom(hideCriteriaAtom)

  const hasAnyHideCriteria = c.name.length > 0 || c.container.length > 0 || c.value >= 0

  if (!hasAnyHideCriteria) {
    return undefined
  }

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      {c.show && (
        <button
          className="show-all"
          title="Clear all hide filters and show all items"
          onClick={() => setHideCriteria({ show: false, name: [], container: [], value: -1 })}
        >
          Unhide All
        </button>
      )}
      <img
        src={c.show ? 'img/eyeClose.png' : 'img/eyeOpen.png'}
        title={`click to ${c.show ? 'Show' : 'Hide'} Hidden items`}
        onClick={() => setHideCriteria({ ...c, show: !c.show })}
        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
      />
    </div>
  )
}

/**
 * Before table controls for filter options
 */
export const InventoryOwnedListBeforeTable: React.FC = () => {
  const opt = useAtomValue(filterOptionsAtom)
  const setFilterOptions = useSetAtom(filterOptionsAtom)

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <div style={{ flex: 1 }} />
      <SwitchButton
        label="R"
        title="Add Reserve to items"
        enabled={opt.reserve}
        onClick={() => setFilterOptions({ ...opt, reserve: !opt.reserve })}
      />
      <SwitchButton
        label="A"
        title="Hide items on auction"
        enabled={opt.auction}
        onClick={() => setFilterOptions({ ...opt, auction: !opt.auction })}
      />
    </div>
  )
}

// Button wrapper components for interactive elements
const HideToggleButton: React.FC<{ item: ItemOwned; type: 'name' | 'value' | 'container' }> = ({ item, type }) => {
  const setHideCriteria = useSetAtom(hideCriteriaAtom)
  const criteria = useAtomValue(hideCriteriaAtom)

  const handleClick = () => {
    if (item.c.hidden.any) {
      // Show - remove from hidden criteria
      switch (type) {
        case 'name':
          setHideCriteria({ ...criteria, name: criteria.name.filter(n => n !== item.data.n) })
          break
        case 'value':
          setHideCriteria({ ...criteria, value: Number(item.data.v) - 0.01 })
          break
        case 'container':
          setHideCriteria({ ...criteria, container: criteria.container.filter(c => c !== item.data.c) })
          break
      }
    } else {
      // Hide - add to hidden criteria
      switch (type) {
        case 'name':
          setHideCriteria({ ...criteria, name: [...criteria.name, item.data.n] })
          break
        case 'value':
          setHideCriteria({ ...criteria, value: Number(item.data.v) })
          break
        case 'container':
          setHideCriteria({ ...criteria, container: [...criteria.container, item.data.c] })
          break
      }
    }
  }

  const getTitles = (): [string, string] => {
    switch (type) {
      case 'name':
        return ['Show this item name', 'Hide this item name']
      case 'value':
        return ['Show this value or higher', 'Hide this value or lower']
      case 'container':
        return ['Show this container', 'Hide this container']
    }
  }

  const [showTitle, hideTitle] = getTitles()
  const hideImg = item.c.hidden.any ? 'img/tick.png' : 'img/cross.png'
  const title = item.c.hidden.any ? showTitle : hideTitle

  return (
    <img
      src={hideImg}
      title={title}
      onClick={handleClick}
      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
    />
  )
}

const toggleTradeItem = (item: ItemOwned, setTradeItemChain: any) => {
  if (item.data.n) {
    if (item.t?.showingTradeItem) {
      setTradeItemChain(undefined)
    } else {
      setTradeItemChain([{
        name: item.data.n,
        sortSecuence: {
          favoriteBlueprints: [],
          ownedBlueprints: [],
          otherBlueprints: []
        }
      }])
    }
  }
}

const TradeItemButton: React.FC<{ item: ItemOwned }> = ({ item }) => {
  const setTradeItemChain = useSetAtom(tradeItemChainAtom)

  const dirImg = item.t?.showingTradeItem ? 'img/left.png' : 'img/right.png'
  const title = item.t?.showingTradeItem ? 'Hide item details' : 'Show item details'

  return (
    <img
      src={dirImg}
      title={title}
      onClick={() => toggleTradeItem(item, setTradeItemChain)}
      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
    />
  )
}

const NameCell: React.FC<{ item: ItemOwned }> = ({ item }) => {
  const setTradeItemChain = useSetAtom(tradeItemChainAtom)

  return (
    <span
      style={{
        fontWeight: item.t?.showingTradeItem ? 'bold' : 'normal',
        flex: 1,
        cursor: 'pointer'
      }}
      title="Click to show/hide details"
      onClick={() => toggleTradeItem(item, setTradeItemChain)}
    >
      {item.data.n}
    </span>
  )
}


const ReloadTTServiceButton: React.FC = () => {
  const handleClick = () => {
    // TODO: Implement TT Service reload via Jotai when async actions are available
    // For now, this functionality is not available in the Jotai-based table
  }

  return (
    <img
      src="img/reload.png"
      title="Reload TT Service from sheet (not yet implemented for Jotai)"
      onClick={handleClick}
      style={{ cursor: 'pointer', width: '16px', height: '16px', opacity: 0.5 }}
      className="img-tt-service-reload"
    />
  )
}

/**
 * Column definitions for the inventory table
 */
export const getInventoryColumnConfig = (isShowingTradeItem: boolean, showReserve: boolean = false): JotaiTableConfig<ItemOwned> => {
  const allAdditionalColummns = [
    {
      id: 'reserve',
      header: 'Reserve',
      renderRowCell: (item: ItemOwned) => {
        return item.t?.reserveAmount !== undefined ? `${item.t.reserveAmount.toFixed(2)} PED` : ''
      },
      sortAccessor: (item: ItemOwned) => item.t?.reserveAmount ?? 0,
      filterAccessor: (item: ItemOwned) => String(item.t?.reserveAmount ?? ''),
      width: 120,
      justifyContent: 'end'
    },
    {
      id: 'ttService',
      header: 'TT Service',
      renderRowCell: (item: ItemOwned) => {
        return item.t?.ttServiceValue !== undefined ? `${item.t.ttServiceValue.toFixed(2)} PED` : ''
      },
      sortAccessor: (item: ItemOwned) => item.t?.ttServiceValue ?? 0,
      filterAccessor: (item: ItemOwned) => String(item.t?.ttServiceValue ?? ''),
      width: 120,
      justifyContent: 'end'
    },
    {
      id: 'container',
      header: 'Container',
      renderRowCell: (item: ItemOwned) => {
        return (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <HideToggleButton item={item} type="container" />
            <span>{item.data.c}</span>
          </div>
        )
      },
      sortAccessor: (item: ItemOwned) => item.data.c,
      filterAccessor: (item: ItemOwned) => item.data.c,
      width: 200,
      justifyContent: 'start'
    }
  ] as any

  const additionalColummns = allAdditionalColummns.filter((col: any) => {
    if (col.id === 'reserve' && !showReserve) {
      return false
    }
    return true
  })

  return {
    title: 'Owned List',
    subtitle: 'List of the Items you own, excluding hidden ones',
    itemTypeName: 'item',
    getRowClass: (item: ItemOwned) => item.c.hidden.any ? 'inventory-hidden-item' : '',
    columns: [
      {
        id: 'name',
        header: 'Name',
        renderRowCell: (item: ItemOwned) => {
          return (
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <HideToggleButton item={item} type="name" />
              <NameCell item={item} />
              <TradeItemButton item={item} />
            </div>
          )
        },
        sortAccessor: (item: ItemOwned) => item.data.n,
        filterAccessor: (item: ItemOwned) => item.data.n,
        width: 300,
        justifyContent: 'start'
      },
      {
        id: 'quantity',
        header: 'Quantity',
        renderRowCell: (item: ItemOwned) => item.data.q,
        sortAccessor: (item: ItemOwned) => {
          const q = item.data.q
          return typeof q === 'string' ? parseInt(q) : q
        },
        filterAccessor: (item: ItemOwned) => String(item.data.q),
        width: 80,
        justifyContent: 'center'
      },
      {
        id: 'value',
        header: 'Value',
        renderRowCell: (item: ItemOwned) => {
          const v = item.data.v
          const display = typeof v === 'string' ? v : String(v)
          return (
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <HideToggleButton item={item} type="value" />
              <span>{display} PED</span>
            </div>
          )
        },
        sortAccessor: (item: ItemOwned) => {
          const v = item.data.v
          return typeof v === 'string' ? parseFloat(v) : v
        },
        filterAccessor: (item: ItemOwned) => String(item.data.v),
        width: 100,
        justifyContent: 'end'
      },
      ...(isShowingTradeItem ? [] : additionalColummns)
    ],
    getPedValue: (item: ItemOwned) => {
      const v = item.data.v
      const value = typeof v === 'string' ? parseFloat(v) : v
      return value
    }
  }
}

/**
 * Blueprint quantity cell component that auto-loads when needed
 */
const BlueprintQuantityCell: React.FC<{
  item: TradeBlueprintLineData
  type: string
}> = ({ item, type }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const loadCraftBlueprint = useSetAtom(loadCraftBlueprintAtom)

  // Check if this is a favorite or owned blueprint
  const shouldAutoLoad = item.quantity === -1 && (type === 'Favorite' || type === 'Owned')

  useEffect(() => {
    if (shouldAutoLoad && !isLoading) {
      setIsLoading(true)
      setError(undefined)

      loadCraftBlueprint(item.bpName)
        .catch((err) => {
          console.error(`Failed to load blueprint ${item.bpName}:`, err)
          setError('Error loading')
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [shouldAutoLoad, item.bpName, loadCraftBlueprint])

  // While loading
  if (isLoading) {
    return <img src="img/loading.gif" title="Loading blueprint data..." style={{ width: '16px', height: '16px' }} />
  }

  // Show error if loading failed
  if (error) {
    return <span title={error} style={{ color: '#d32f2f' }}>{error}</span>
  }

  // Show the quantity value or "not loaded"
  return <span>{item.quantity === -1 ? 'not loaded' : item.quantity?.toString()}</span>
}

/**
 * Blueprint star button component for trade item details
 */
const BlueprintStarButton: React.FC<{
  bpName: string
  isStarred: boolean
  chainIndex?: number
}> = ({ bpName, isStarred, chainIndex = 0 }) => {
  const setBlueprintStared = useSetAtom(setBlueprintStaredAtom)

  const handleClick = () => {
    setBlueprintStared(bpName, !isStarred)
  }

  return (
    <img
      src={isStarred ? 'img/staron.png' : 'img/staroff.png'}
      title={isStarred ? 'Remove from Favorites' : 'Add to Favorites'}
      onClick={handleClick}
      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
    />
  )
}

/**
 * Blueprint link button component for trade item details
 */
const BlueprintLinkButton: React.FC<{
  bpName: string
}> = ({ bpName }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigateTo(navigate, craftBlueprintUrl(bpName))
  }

  return (
    <img
      src='img/right.png'
      title='Open this blueprint'
      onClick={handleClick}
      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
    />
  )
}

/**
 * Create blueprint table config for trade item details
 */
export const createBlueprintTableConfig = (
  type: string,
  isStarred: boolean | undefined
): JotaiTableConfig<TradeBlueprintLineData> => {
  return {
    title: `${type} Blueprint`,
    itemTypeName: 'blueprint',
    columns: [
      {
        id: 'bpName',
        header: `${type} Blueprint`,
        renderRowCell: (item: TradeBlueprintLineData) => {
          return (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ flex: 1 }}>{item.bpName}</span>
              {isStarred !== undefined && (
                <BlueprintStarButton
                  bpName={item.bpName}
                  isStarred={isStarred}
                />
              )}
              <BlueprintLinkButton bpName={item.bpName} />
            </div>
          )
        },
        sortAccessor: (item: TradeBlueprintLineData) => item.bpName,
        filterAccessor: (item: TradeBlueprintLineData) => item.bpName,
        width: 300,
        justifyContent: 'start'
      },
      {
        id: 'quantity',
        header: 'Quantity per Click',
        renderRowCell: (item: TradeBlueprintLineData) =>
          <BlueprintQuantityCell item={item} type={type} />,
        sortAccessor: (item: TradeBlueprintLineData) =>
          item.quantity === -1 ? Number.MAX_VALUE : item.quantity,
        width: 100,
        justifyContent: 'center'
      }
    ]
  }
}

/**
 * Create refining table config for trade item details
 */
export const createRefiningTableConfig = (
  onRowClick: (productName: string, event: React.MouseEvent) => void
): JotaiTableConfig<any> => {
  return {
    title: 'Refining Outputs',
    itemTypeName: 'refining',
    columns: [
      {
        id: 'product',
        header: 'Refined Material',
        renderRowCell: (item: any) => {
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{item.product.name}</span>
              <img
                src={item.isSelected ? 'img/left.png' : 'img/right.png'}
                style={{ width: '14px', height: '14px', opacity: 0.6 }}
              />
            </div>
          )
        },
        sortAccessor: (item: any) => item.product.name,
        filterAccessor: (item: any) => item.product.name,
        width: 300,
        justifyContent: 'start'
      },
      {
        id: 'quantity',
        header: 'Quantity Required',
        renderRowCell: (item: any) => item.product.quantity?.toString(),
        sortAccessor: (item: any) => item.product.quantity ?? 0,
        filterAccessor: (item: any) => item.product.quantity?.toString() ?? '',
        width: 150,
        justifyContent: 'end'
      }
    ],
    getRowClass: () => 'item-row stable pointer',
    onRowClick: (item: any, _index: number, event: React.MouseEvent) => {
      event.stopPropagation()
      onRowClick(item.product.name, event)
    }
  }
}

/**
 * Create TT Service inventory table config
 */
export const createTTServiceTableConfig = (): JotaiTableConfig<TTServiceSheetItem> => {
  return {
    title: 'TT Service Inventory',
    itemTypeName: 'transaction',
    columns: [
      {
        id: 'date',
        header: 'Date',
        renderRowCell: (item: TTServiceSheetItem) => item.date,
        sortAccessor: (item: TTServiceSheetItem) => item.date,
        filterAccessor: (item: TTServiceSheetItem) => item.date,
        width: 120,
        justifyContent: 'start'
      },
      {
        id: 'player',
        header: 'Player',
        renderRowCell: (item: TTServiceSheetItem) => item.player,
        sortAccessor: (item: TTServiceSheetItem) => item.player,
        filterAccessor: (item: TTServiceSheetItem) => item.player,
        width: 150,
        justifyContent: 'start'
      },
      {
        id: 'quantity',
        header: 'Quantity',
        renderRowCell: (item: TTServiceSheetItem) => item.quantity,
        sortAccessor: (item: TTServiceSheetItem) => item.quantity,
        filterAccessor: (item: TTServiceSheetItem) => item.quantity.toString(),
        width: 100,
        justifyContent: 'end'
      },
      {
        id: 'value',
        header: 'Value',
        renderRowCell: (item: TTServiceSheetItem) => item.value.toFixed(2),
        sortAccessor: (item: TTServiceSheetItem) => item.value,
        filterAccessor: (item: TTServiceSheetItem) => item.value.toFixed(2),
        width: 100,
        justifyContent: 'end'
      }
    ],
    getPedValue: (item: TTServiceSheetItem) => item.value
  }
}
