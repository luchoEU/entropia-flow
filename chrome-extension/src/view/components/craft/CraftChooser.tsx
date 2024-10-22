import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addBlueprint, removeBlueprint } from '../../application/actions/craft'
import { setOwnedBlueprintsExpanded, setOwnedBlueprintsFilter, sortOwnedBlueprintsBy } from '../../application/actions/inventory'
import { getCraft } from '../../application/selectors/craft'
import { getInventory } from '../../application/selectors/inventory'
import { CraftState } from '../../application/state/craft'
import { InventoryState } from '../../application/state/inventory'
import ExpandableSection from '../common/ExpandableSection'
import SearchInput from '../common/SearchInput'
import SortableTable from '../common/SortableTable'
import { NAME, sortColumnDefinition } from '../../application/helpers/craftSort'

function CraftChooser() {
    const inv: InventoryState = useSelector(getInventory)
    const s: CraftState = useSelector(getCraft)
    const dispatch = useDispatch()

    let bp = inv.blueprints.showList.items.map(d => d.n)
    let added = s.blueprints.map(d => d.name)
    let unique = bp.filter((element, index) => { // show only 1 instance of each blueprint
        return bp.indexOf(element) === index;
    })

    return (
        <>
            <ExpandableSection title='Owned Blueprints' expanded={inv.blueprints.originalList.expanded} setExpanded={setOwnedBlueprintsExpanded}>
                <div className='search-container'>
                    <p>Count {unique.length} blueprint{unique.length == 1 ? '' : 's'}</p>
                    <p className='search-input-container'><SearchInput filter={inv.blueprints.filter} setFilter={setOwnedBlueprintsFilter} /></p>
                </div>
                <SortableTable sortType={inv.blueprints.showList.sortType}
                    sortBy={sortOwnedBlueprintsBy}
                    columns={[NAME]}
                    definition={sortColumnDefinition}>
                    { unique.map((n: string) =>
                        <tr key={n}>
                            <td>
                                {n}
                                { added.includes(n) ?
                                    <img src="img/staron.png" onClick={() => { dispatch(removeBlueprint(n)) }}></img> :
                                    <img src="img/staroff.png" onClick={() => { dispatch(addBlueprint(n)) }}></img>
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
