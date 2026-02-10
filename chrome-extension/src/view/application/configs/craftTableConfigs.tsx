import { JotaiTableConfig } from '../../components/common/jotai/JotaiTableTypes'

/**
 * Interface for blueprint tabular items
 * Matches the BlueprintTabularItem interface from tabular/craft.ts
 */
export interface BlueprintTabularItem {
  name: string
  stared: boolean
  quantity: number
}

/**
 * Callbacks needed for craft blueprint table
 */
export interface CraftBlueprintCallbacks {
  navigateToBlueprint: (name: string) => void
  toggleStared: (name: string, stared: boolean) => void
}

/**
 * Craft Blueprint Table Config Factory
 * Shows available blueprints with quantity and favorite status
 */
export function createCraftBlueprintConfig(
  callbacks: CraftBlueprintCallbacks
): JotaiTableConfig<BlueprintTabularItem> {
  return {
    title: 'Blueprints',
    columns: [
      {
        id: 'name',
        header: 'Name',
        sortAccessor: (item) => item.name,
        filterAccessor: (item) => item.name,
        renderRow: (item) => ({
          type: 'row' as const,
          gap: 4,
          children: [
            {
              type: 'text' as const,
              value: item.name,
              title: item.name
            },
            {
              type: 'button' as const,
              icon: 'img/right.png',
              width: 16,
              title: 'Show item details',
              onClick: () => callbacks.navigateToBlueprint(item.name)
            },
            {
              type: 'spacer' as const
            },
            {
              type: 'button' as const,
              icon: item.stared ? 'img/staron.png' : 'img/staroff.png',
              width: 16,
              title: item.stared ? 'Remove from Favorites' : 'Add to Favorites',
              onClick: () => callbacks.toggleStared(item.name, !item.stared)
            }
          ]
        })
      },
      {
        id: 'quantity',
        header: 'Quantity',
        sortAccessor: (item) => item.quantity,
        filterAccessor: (item) => item.quantity.toString(),
        renderRow: (item) => ({
          type: 'text' as const,
          value: item.quantity.toString()
        }),
        justifyContent: 'end' as const
      }
    ]
  }
}
