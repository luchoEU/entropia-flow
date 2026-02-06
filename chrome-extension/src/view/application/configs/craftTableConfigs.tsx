import React from 'react'
import { useSetAtom } from 'jotai'
import { useNavigate } from 'react-router-dom'
import { JotaiTableConfig } from '../../components/common/jotai/JotaiTableTypes'
import { setBlueprintStaredAtom } from '../atoms/craft'
import { formatToUrl } from '../helpers/navigation'
import { TabId } from '../state/navigation'
import ImgButton from '../../components/common/ImgButton'
import ItemText from '../../components/common/ItemText'

/**
 * Interface for blueprint tabular items
 * Matches the BlueprintTabularItem interface from tabular/craft.ts
 */
interface BlueprintTabularItem {
  name: string
  stared: boolean
  quantity: number
}

/**
 * Craft Blueprint Table Config
 * Shows available blueprints with quantity and favorite status
 */
export const craftBlueprintConfig: JotaiTableConfig<BlueprintTabularItem> = {
  title: 'Blueprints',
  columns: [
    {
      id: 'name',
      header: 'Name',
      width: 200,
      sortAccessor: (item) => item.name,
      filterAccessor: (item) => item.name,
      renderRowCell: (item) => {
        const navigate = useNavigate()
        const setStared = useSetAtom(setBlueprintStaredAtom)

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
            <ItemText text={item.name} />
            <ImgButton
              title="Show item details"
              src="img/right.png"
              dispatch={() => navigate(`${TabId.CRAFT}/${formatToUrl(item.name)}`)}
            />
            <div style={{ flex: 1 }} />
            <ImgButton
              title={item.stared ? 'Remove from Favorites' : 'Add to Favorites'}
              src={item.stared ? 'img/staron.png' : 'img/staroff.png'}
              dispatch={() => setStared(item.name, !item.stared)}
            />
          </div>
        )
      }
    },
    {
      id: 'quantity',
      header: 'Quantity',
      width: 80,
      sortAccessor: (item) => item.quantity,
      filterAccessor: (item) => item.quantity.toString(),
      renderRowCell: (item) => <span>{item.quantity.toString()}</span>,
      justifyContent: 'end'
    }
  ]
}
