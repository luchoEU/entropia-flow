import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setBlueprintActivePage, setBlueprintStared } from '../../application/actions/craft'
import { setOwnedBlueprintsExpanded, setOwnedBlueprintsFilter, sortOwnedBlueprintsBy } from '../../application/actions/inventory'
import { getCraft } from '../../application/selectors/craft'
import { getInventory } from '../../application/selectors/inventory'
import { CraftState } from '../../application/state/craft'
import { InventoryState } from '../../application/state/inventory'
import ExpandableSection from '../common/ExpandableSection'
import SearchInput from '../common/SearchInput'
import SortableTable from '../common/SortableTable'
import { NAME, sortColumnDefinition } from '../../application/helpers/craftSort'
import ImgButton from '../common/ImgButton'
import ItemText from '../common/ItemText'

function CraftChooser() {
    const inv: InventoryState = useSelector(getInventory)
    const s: CraftState = useSelector(getCraft)
    const dispatch = useDispatch()

    let bp = inv.blueprints.showList.items.map(d => d.n)
    let unique = bp.filter((element, index) => { // show only 1 instance of each blueprint
        return bp.indexOf(element) === index;
    })

    return (
        <>
            <ExpandableSection title='Owned Blueprints' expanded={inv.blueprints.originalList.expanded} setExpanded={setOwnedBlueprintsExpanded}>
                <div className='search-container'>
                    <p>Listing {unique.length} blueprint{unique.length == 1 ? '' : 's'}</p>
                    <p className='search-input-container'><SearchInput filter={inv.blueprints.filter} setFilter={setOwnedBlueprintsFilter} /></p>
                </div>
                <SortableTable sortType={inv.blueprints.showList.sortType}
                    sortBy={sortOwnedBlueprintsBy}
                    columns={[NAME]}
                    definition={sortColumnDefinition}>
                    { unique.map((n: string) =>
                        <tr key={n} className='item-row'
                            onClick={(e) => { e.stopPropagation(); dispatch(setBlueprintActivePage(n)) }}>
                            <td>
                                <ItemText text={n} />
                                { s.stared.list.includes(n) ?
                                    <ImgButton title='Remove from Favorite Blueprints' src="img/staron.png" dispatch={() => setBlueprintStared(n, true)} /> :
                                    <ImgButton title='Add to Favorite Blueprints' src="img/staroff.png" dispatch={() => setBlueprintStared(n, true)} />
                                }
                            </td>
                        </tr>
                    )}
                </SortableTable>
            </ExpandableSection>
        </>
    )
}

export default CraftChooser
