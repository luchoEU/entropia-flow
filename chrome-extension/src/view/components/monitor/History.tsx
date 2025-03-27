import React from 'react'
import { useSelector } from 'react-redux';
import { getHistory } from '../../application/selectors/history'
import { HistoryState, ViewInventory } from '../../application/state/history'
import ExpandableSection from '../common/ExpandableSection2';
import InventoryItem from './InventoryItem'

const History = () => {
    const history: HistoryState = useSelector(getHistory)

    if (history.list.length > 0) {
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
    } else {
        return <></>
    }
}

export default History
