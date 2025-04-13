import React from 'react'
import { useDispatch } from 'react-redux'
import { sortBy, setItemExpanded, exportToFile } from '../../application/actions/history'
import { setAsLast } from '../../application/actions/messages'
import { ViewInventory, ViewItemData } from '../../application/state/history'
import InventoryDifference from './InventoryDifference'
import ExpandablePlusButton from '../common/ExpandablePlusButton'
import ItemText from '../common/ItemText'
import ImgButton from '../common/ImgButton'

const InventoryItem = (p: { item: ViewInventory }) => {
    const { item } = p
    const dispatch = useDispatch()

    const config = {
        sortBy: (part: number) => () => dispatch(sortBy(item.key, part)),
        allowExclude: false,
        showPeds: false,
        showMarkup: false,
        movedTitle: 'this item was moved by this amount (parenthesis)'
    }
    
    let expandedClass = 'button-diff'
    if (item.diff && item.diff.some((i: ViewItemData) => i.a !== undefined))
        expandedClass += ' button-with-actions'

    return <>
        <tr className='item-row' onClick={() => dispatch(setItemExpanded(item.key)(!item.expanded))}>
            <td>
                <ExpandablePlusButton
                    className={item.class}
                    expanded={item.diff ? item.expanded : undefined}
                    setExpanded={setItemExpanded(item.key)}
                />
                <ItemText className={item.class} text={ item.text } />
                { item.info &&
                    <span
                        className='img-info'
                        title={item.info}>i</span>
                }
                { item.canBeLast && <ImgButton
                    title='Export all items to a file'
                    src='img/export.png'
                    className='img-export'
                    dispatch={() => exportToFile(item.key)} />
                }
            </td>
            <td>
                { item.isLast ?
                    <span className='label-up'>Session Start</span> :
                    (item.canBeLast &&
                        <span className='img-up' title='Set this moment as the start of the session'
                            onClick={(e) => {
                                e.stopPropagation()
                                dispatch(setAsLast(item.key))
                            }}>
                            <img src='img/up.png' />Session Start
                        </span>)
                }
            </td>
        </tr>
        { item.expanded && <tr><td colSpan={2}>
                <InventoryDifference diff={item.diff} peds={[]} config={config} />
            </td></tr>
        }
    </>
}

export default InventoryItem
