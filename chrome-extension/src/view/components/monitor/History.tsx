import React from 'react'
import { useSelector } from 'react-redux';
import { setHistoryExpanded } from '../../application/actions/history';
import { getHistory } from '../../application/selectors/history'
import { HistoryState, ViewInventory } from '../../application/state/history'
import ExpandableSection from '../common/ExpandableSection';
import InventoryItem from './InventoryItem'

const History = () => {
    const history: HistoryState = useSelector(getHistory)

    if (history.list.length > 0) {
        return (
            <ExpandableSection
                title='History'
                expanded={history.expanded}
                setExpanded={setHistoryExpanded}>
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
