import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addBlueprint } from '../../application/actions/craft'
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
    let unique = bp.filter((element, index) => {
        return bp.indexOf(element) === index && !added.includes(element);
    })

    return (
        <>
            <ExpandableSection title='Owned Blueprints' expanded={inv.blueprints.originalList.expanded} setExpanded={setOwnedBlueprintsExpanded}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <p>Count {unique.length} blueprint{unique.length == 1 ? '' : 's'}</p>
                    <SearchInput filter={inv.blueprints.filter} setFilter={setOwnedBlueprintsFilter} />
                </div>
                <SortableTable sortType={inv.blueprints.showList.sortType}
                    sortBy={sortOwnedBlueprintsBy}
                    columns={[NAME]}
                    definition={sortColumnDefinition}>
                    { unique.map((n: string) =>
                        <tr key={n}>
                            <td>
                                {n}
                                <img src="img/staroff.png" onClick={() => { dispatch(addBlueprint(n)) }}></img>
                            </td>
                        </tr>
                    )}
                </SortableTable>
            </ExpandableSection>
        </>
    )
}

export default CraftChooser
