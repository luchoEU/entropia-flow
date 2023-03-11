import React from 'react'
import { useDispatch } from 'react-redux'
import { sortBy, setItemExpanded } from '../../application/actions/history'
import { setAsLast } from '../../application/actions/messages'
import { ViewInventory, ViewItemData } from '../../application/state/history'
import InventoryDifference from './InventoryDifference'

const InventoryItem = (p: { item: ViewInventory }) => {
    const { item } = p
    const dispatch = useDispatch()

    const config = {
        sortBy: (part: number) => () => dispatch(sortBy(item.key, part)),
        allowExclude: false,
        showPeds: false,
        movedTitle: 'this item was moved by this amount (parenthesis)'
    }

    const _toggleExpanded = () => dispatch(setItemExpanded(item.key, !item.expanded))
    let expandedClass = 'button-diff'
    if (item.diff && item.diff.some((i: ViewItemData) => i.a !== undefined))
        expandedClass += ' button-with-actions'

    return (
        <>
            <p {...(item.class !== null ? { className: item.class } : {})}>
                <button className={expandedClass} onClick={_toggleExpanded}>
                    {item.diff === null ? '' : (item.expanded ? '-' : '+')}
                </button>
                {item.text}
                {item.info !== null ?
                    <span
                        className='img-info'
                        title={item.info}>i</span>
                    : ''
                }
                {item.isLast ?
                    <span className='label-up'>Last</span> :
                    item.canBeLast ?
                        <span className='img-up'
                            onClick={() => dispatch(setAsLast(item.key))}>
                            <img src='img/up.png' />Last</span>
                        : ''
                }
            </p>
            {item.expanded ?
                <InventoryDifference diff={item.diff} peds={[]} config={config} />
                : ''}
        </>
    )
}

export default InventoryItem
