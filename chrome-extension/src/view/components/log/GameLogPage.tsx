import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { GameLogItemData, GameLogState } from '../../application/state/log'
import { getGameLog } from '../../application/selectors/log'
import ExpandableSection from '../common/ExpandableSection'
import { setGameLogLootExpanded, sortLootBy } from '../../application/actions/log'
import { NAME, QUANTITY, VALUE } from '../../application/helpers/inventory.sort'

const LootRow = (p: {
    item: GameLogItemData
}) => {
    const { item } = p
    const dispatch = useDispatch()
    const sortBy = (part: number) => () => dispatch(sortLootBy(part))

    return (
        <tr>
            <td onClick={sortBy(NAME)}>{item.n}</td>
            <td onClick={sortBy(QUANTITY)}>{item.q}</td>
            <td onClick={sortBy(VALUE)}>{item.v + ' PED'}</td>
        </tr>
    )
}

function GameLogPage() {
    const s: GameLogState = useSelector(getGameLog)
    
    return (
        <>
            <ExpandableSection title='Total' expanded={s.loot.expanded} setExpanded={setGameLogLootExpanded}>
                <table className='table-diff'>
                    <tbody>
                        {
                            s.loot.items.map((item: GameLogItemData) =>
                                <LootRow
                                    key={item.n}
                                    item={item} />
                            )
                        }
                    </tbody>
                </table>
            </ExpandableSection>
        </>
    )
}

export default GameLogPage