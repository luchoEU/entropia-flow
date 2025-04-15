import React from 'react'
import { useSelector } from 'react-redux';
import { getHistory } from '../../application/selectors/history'
import { HistoryState, ViewInventory } from '../../application/state/history'
import ExpandableSection from '../common/ExpandableSection2';
import InventoryItem from './InventoryItem'
import { STRING_NO_DATA } from '../../../common/const';

const History = () => {
    const history: HistoryState = useSelector(getHistory)

    if (history.list.length === 0 ||
        history.list.length === 1 && history.list[0].rawInventory.log?.message === STRING_NO_DATA
    ) {
        return <></>
    }

    return (
        <ExpandableSection selector='History' title='History' subtitle='History of changes to your items'>
            <table className='table-history'>
                <tbody>
                {
                    history.list.map((inv: ViewInventory) =>
                        <InventoryItem key={inv.key} item={inv} />)
                }
                </tbody>
            </table>
        </ExpandableSection>
    )
}

export default History
