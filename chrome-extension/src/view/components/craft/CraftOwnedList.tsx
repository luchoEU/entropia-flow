import React from 'react'
import { useSelector } from 'react-redux'
import { setBlueprintStared } from '../../application/actions/craft'
import { setOwnedBlueprintsFilter, sortOwnedBlueprintsBy } from '../../application/actions/inventory'
import { getCraft, isBlueprintStared } from '../../application/selectors/craft'
import { getInventory } from '../../application/selectors/inventory'
import { CraftState } from '../../application/state/craft'
import { InventoryState } from '../../application/state/inventory'
import ExpandableSection from '../common/ExpandableSection2'
import SearchInput from '../common/SearchInput'
import SortableTable from '../common/SortableTable'
import { NAME, sortColumnDefinition } from '../../application/helpers/craftSort'
import ImgButton from '../common/ImgButton'
import ItemText from '../common/ItemText'
import { useNavigate } from 'react-router-dom'
import { craftBlueprintUrl } from '../../application/actions/navigation'

const StarButton = ({ bpName }: { bpName: string }) => {
    const stared = useSelector(isBlueprintStared(bpName))
    return <ImgButton
        title={`${stared ? 'Remove from' : 'Add to'} Favorite Blueprints`}
        src={stared ? 'img/staron.png' : 'img/staroff.png'}
        dispatch={() => setBlueprintStared(bpName, !stared)} />
}

function CraftOwnedList() {
    const inv: InventoryState = useSelector(getInventory)
    const s: CraftState = useSelector(getCraft)
    const navigate = useNavigate()

    let bp = inv.blueprints.showList.items.map(d => d.n)
    let unique = bp.filter((element, index) => { // show only 1 instance of each blueprint
        return bp.indexOf(element) === index;
    })

    return (
        <>
            <ExpandableSection selector='CraftChooser.OwnedBlueprints' title='Owned Blueprints' subtitle='List of the Blueprints you own'>
                <div className='search-container'>
                    <p>Listing {unique.length} blueprint{unique.length == 1 ? '' : 's'}</p>
                    <p className='search-input-container'><SearchInput filter={inv.blueprints.filter} setFilter={setOwnedBlueprintsFilter} /></p>
                </div>
                <SortableTable sortType={inv.blueprints.showList.sortType}
                    sortBy={sortOwnedBlueprintsBy}
                    columns={[NAME]}
                    definition={sortColumnDefinition}>
                    { unique.map((n: string) =>
                        <tr key={n} className='item-row pointer'
                            onClick={(e) => { e.stopPropagation(); navigate(craftBlueprintUrl(n)) }}>
                            <td>
                                <ItemText text={n} />
                                <img src="img/right.png" />
                            </td>
                            <td><StarButton bpName={n} /></td>
                        </tr>
                    )}
                </SortableTable>
            </ExpandableSection>
        </>
    )
}

export default CraftOwnedList
export { StarButton }
