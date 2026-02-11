import React, { useEffect } from 'react'
import { useSetAtom, useAtomValue } from 'jotai'
import { ItemOwned } from '../state/inventory'
import { JotaiTableConfig, JotaiTableColumn } from '../../components/common/jotai/JotaiTableTypes'
import { TTServiceSheetItem } from '../state/ttService'
import { useNavigate } from 'react-router-dom'
import {
  hideCriteriaAtom,
  filterOptionsAtom,
  setTradeItemChainAtom
} from './inventory'
import { formatToUrl } from '../helpers/navigation'
import { TabId } from '../state/navigation'
import { loadCraftBlueprintAtom, setBlueprintStaredAtom, blueprintsAtom } from './craft'
import { RefiningWebData } from '../../../web/state'

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
      <SwitchButton
        label="G"
        title="Aggregate Refined materials with sources"
        enabled={opt.aggregateRefined}
        onClick={() => setFilterOptions({ ...opt, aggregateRefined: !opt.aggregateRefined })}
      />
    </div>
  )
}


/**
 * Callbacks for inventory table interactions
 */
export interface InventoryTableCallbacks {
  toggleHideName: (name: string, isCurrentlyHidden: boolean) => void
  toggleHideValue: (value: number, isCurrentlyHidden: boolean) => void
  toggleHideContainer: (container: string, isCurrentlyHidden: boolean) => void
  toggleTradeItem: (item: ItemOwned) => void
}

/**
 * Column definitions for the inventory table
 */
export const getInventoryColumnConfig = (
  isShowingTradeItem: boolean,
  showReserve: boolean = false,
  callbacks: InventoryTableCallbacks
): JotaiTableConfig<ItemOwned> => {
  const allAdditionalColummns: JotaiTableColumn<ItemOwned>[] = [
    {
      id: 'reserve',
      header: 'Reserve',
      renderRow: (item: ItemOwned) => ({
        type: 'text' as const,
        value: item.t?.reserveAmount !== undefined ? `${item.t.reserveAmount.toFixed(2)} PED` : ''
      }),
      sortAccessor: (item: ItemOwned) => item.t?.reserveAmount ?? 0,
      filterAccessor: (item: ItemOwned) => String(item.t?.reserveAmount ?? ''),
      justifyContent: 'end'
    },
    {
      id: 'ttService',
      header: 'TT Service',
      renderRow: (item: ItemOwned) => ({
        type: 'text' as const,
        value: item.t?.ttServiceValue !== undefined ? `${item.t.ttServiceValue.toFixed(2)} PED` : ''
      }),
      sortAccessor: (item: ItemOwned) => item.t?.ttServiceValue ?? 0,
      filterAccessor: (item: ItemOwned) => String(item.t?.ttServiceValue ?? ''),
      justifyContent: 'end'
    },
    {
      id: 'container',
      header: 'Container',
      renderRow: (item: ItemOwned) => ({
        type: 'row' as const,
        gap: 4,
        children: [
          {
            type: 'button' as const,
            icon: item.c.hidden.any ? 'img/tick.png' : 'img/cross.png',
            width: 16,
            title: item.c.hidden.any ? 'Show this container' : 'Hide this container',
            onClick: () => callbacks.toggleHideContainer(item.data.c, item.c.hidden.any)
          },
          {
            type: 'text' as const,
            value: item.data.c
          }
        ]
      }),
      sortAccessor: (item: ItemOwned) => item.data.c,
      filterAccessor: (item: ItemOwned) => item.data.c,
      justifyContent: 'start'
    }
  ]

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
        renderRow: (item: ItemOwned) => ({
          type: 'row' as const,
          gap: 4,
          children: [
            {
              type: 'button' as const,
              icon: item.c.hidden.any ? 'img/tick.png' : 'img/cross.png',
              width: 16,
              title: item.c.hidden.any ? 'Show this item name' : 'Hide this item name',
              onClick: () => callbacks.toggleHideName(item.data.n, item.c.hidden.any)
            },
            {
              type: 'text' as const,
              value: item.data.n,
              style: {
                fontWeight: item.t?.showingTradeItem ? 'bold' : 'normal',
                flex: 1,
                cursor: 'pointer'
              },
              title: 'Click to show/hide details',
              onClick: () => callbacks.toggleTradeItem(item)
            },
            {
              type: 'button' as const,
              icon: item.t?.showingTradeItem ? 'img/left.png' : 'img/right.png',
              width: 16,
              title: item.t?.showingTradeItem ? 'Hide item details' : 'Show item details',
              onClick: () => callbacks.toggleTradeItem(item)
            }
          ]
        }),
        sortAccessor: (item: ItemOwned) => item.data.n,
        filterAccessor: (item: ItemOwned) => item.data.n,
        justifyContent: 'start'
      },
      {
        id: 'quantity',
        header: 'Quantity',
        renderRow: (item: ItemOwned) => ({
          type: 'text' as const,
          value: String(item.data.q)
        }),
        sortAccessor: (item: ItemOwned) => {
          const q = item.data.q
          return typeof q === 'string' ? parseInt(q) : q
        },
        filterAccessor: (item: ItemOwned) => String(item.data.q),
        justifyContent: 'center'
      },
      {
        id: 'value',
        header: 'Value',
        renderRow: (item: ItemOwned) => {
          const v = item.data.v
          const display = typeof v === 'string' ? v : String(v)
          return {
            type: 'row' as const,
            gap: 4,
            children: [
              {
                type: 'button' as const,
                icon: item.c.hidden.any ? 'img/tick.png' : 'img/cross.png',
                width: 16,
                title: item.c.hidden.any ? 'Show this value or higher' : 'Hide this value or lower',
                onClick: () => callbacks.toggleHideValue(Number(item.data.v), item.c.hidden.any)
              },
              {
                type: 'text' as const,
                value: `${display} PED`
              }
            ]
          }
        },
        sortAccessor: (item: ItemOwned) => {
          const v = item.data.v
          return typeof v === 'string' ? parseFloat(v) : v
        },
        filterAccessor: (item: ItemOwned) => String(item.data.v),
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
 * Callbacks for blueprint table interactions
 */
export interface BlueprintTableCallbacks {
  toggleStar: (bpName: string) => void
  navigateToBlueprint: (bpName: string) => void
  getBlueprintQuantity: (bpName: string) => { loading: boolean; quantity?: number }
}

/**
 * Create blueprint table config for trade item details
 */
export const createBlueprintTableConfig = (
  type: string,
  isStarred: boolean | undefined,
  callbacks: BlueprintTableCallbacks
): JotaiTableConfig<string> => {
  return {
    title: `${type} Blueprint`,
    itemTypeName: 'blueprint',
    columns: [
      {
        id: 'bpName',
        header: `${type} Blueprint`,
        renderRow: (bpName: string) => ({
          type: 'row' as const,
          gap: 8,
          children: [
            {
              type: 'text' as const,
              value: bpName,
              style: { flex: 1 }
            },
            ...(isStarred !== undefined ? [{
              type: 'button' as const,
              icon: isStarred ? 'img/staron.png' : 'img/staroff.png',
              width: 16,
              title: isStarred ? 'Remove from Favorites' : 'Add to Favorites',
              onClick: () => callbacks.toggleStar(bpName)
            }] : []),
            {
              type: 'button' as const,
              icon: 'img/right.png',
              width: 16,
              title: 'Open this blueprint',
              onClick: () => callbacks.navigateToBlueprint(bpName)
            }
          ]
        }),
        sortAccessor: (bpName: string) => bpName,
        filterAccessor: (bpName: string) => bpName,
        justifyContent: 'start'
      },
      {
        id: 'quantity',
        header: 'Quantity per Click',
        renderRow: (bpName: string) => {
          const { loading, quantity } = callbacks.getBlueprintQuantity(bpName)

          if (loading) {
            return {
              type: 'icon' as const,
              src: 'img/loading.gif',
              width: 16,
              height: 16,
              title: 'Loading blueprint data...'
            }
          }

          return {
            type: 'text' as const,
            value: quantity === undefined ? 'not loaded' : quantity.toString()
          }
        },
        justifyContent: 'center'
      }
    ]
  }
}

/**
 * Create refining table config for trade item details
 */
export const createRefiningTableConfig = (
  chainNext: string | undefined,
  chainIndex: number,
  ingredientName: string  
): JotaiTableConfig<RefiningWebData> => {
  const setTradeItemChain = useSetAtom(setTradeItemChainAtom)

  return {
    title: 'Refining Outputs',
    itemTypeName: 'refining',
    columns: [
      {
        id: 'product',
        header: 'Refined Material',
        renderRow: (item: RefiningWebData) => ({
          type: 'row' as const,
          gap: 6,
          children: [
            {
              type: 'text' as const,
              value: item.product.name
            },
            {
              type: 'icon' as const,
              src: chainNext === item.product.name ? 'img/left.png' : 'img/right.png',
              width: 14,
              height: 14,
              style: { opacity: 0.6 }
            }
          ]
        }),
        sortAccessor: (item: RefiningWebData) => item.product.name,
        filterAccessor: (item: RefiningWebData) => item.product.name,
        justifyContent: 'start'
      },
      {
        id: 'quantity',
        header: 'Quantity Required',
        renderRow: (item: RefiningWebData) => ({
          type: 'text' as const,
          value: item.ingredients.find((i) => i.name === ingredientName)?.quantity?.toString() ?? ''
        }),
        sortAccessor: (item: RefiningWebData) => item.ingredients.find((i) => i.name === ingredientName)?.quantity ?? 0,
        filterAccessor: (item: RefiningWebData) => item.ingredients.find((i) => i.name === ingredientName)?.quantity?.toString() ?? '',
        justifyContent: 'end'
      }
    ],
    getRowClass: () => 'item-row stable pointer',
    onRowClick: (item: RefiningWebData, _index: number, event: React.MouseEvent) => {
      event.stopPropagation()
      setTradeItemChain(chainNext === item.product.name ? undefined : item.product.name, chainIndex + 1)
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
        renderRow: (item: TTServiceSheetItem) => ({
          type: 'text' as const,
          value: item.date
        }),
        sortAccessor: (item: TTServiceSheetItem) => new Date(item.date).getTime(), // TODO: returns NaN
        filterAccessor: (item: TTServiceSheetItem) => item.date,
        justifyContent: 'start'
      },
      {
        id: 'player',
        header: 'Player',
        renderRow: (item: TTServiceSheetItem) => ({
          type: 'text' as const,
          value: item.player
        }),
        sortAccessor: (item: TTServiceSheetItem) => item.player,
        filterAccessor: (item: TTServiceSheetItem) => item.player,
        justifyContent: 'start'
      },
      {
        id: 'quantity',
        header: 'Quantity',
        renderRow: (item: TTServiceSheetItem) => ({
          type: 'text' as const,
          value: item.quantity.toString()
        }),
        sortAccessor: (item: TTServiceSheetItem) => item.quantity,
        filterAccessor: (item: TTServiceSheetItem) => item.quantity.toString(),
        justifyContent: 'end'
      },
      {
        id: 'value',
        header: 'Value',
        renderRow: (item: TTServiceSheetItem) => ({
          type: 'text' as const,
          value: item.value.toFixed(2)
        }),
        sortAccessor: (item: TTServiceSheetItem) => item.value,
        filterAccessor: (item: TTServiceSheetItem) => item.value.toFixed(2),
        justifyContent: 'end'
      }
    ],
    getPedValue: (item: TTServiceSheetItem) => item.value
  }
}
