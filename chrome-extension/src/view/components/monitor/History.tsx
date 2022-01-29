import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setHistoryExpanded } from '../../application/actions/history';
import { getHistory } from '../../application/selectors/history'
import { HistoryState, ViewInventory } from '../../application/state/history'
import InventoryItem from './InventoryItem'

const History = () => {
    const history: HistoryState = useSelector(getHistory)
    const dispatch = useDispatch()

    if (history.list.length > 0) {
        return (
            <section>
                <h1>History
                    {history.expanded ?
                        <img className='hide' src='img/up.png' onClick={() => dispatch(setHistoryExpanded(false))} /> :
                        <img src='img/down.png' onClick={() => dispatch(setHistoryExpanded(true))} />}
                </h1>
                {
                    history.expanded ?
                        history.list.map((inv: ViewInventory) =>
                            <InventoryItem key={inv.key} item={inv} />
                        ) : ''
                }
            </section>
        )
    } else {
        return <></>
    }
}

export default History
