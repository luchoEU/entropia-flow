import React from 'react'
import { useDispatch } from 'react-redux'
import { ItemData } from '../../../common/state'
import { NAME, QUANTITY, VALUE } from '../../application/helpers/inventory.sort'
import { InventoryList } from '../../application/state/inventory'
import ExpandableSection from '../common/ExpandableSection'

const ItemRow = (p: {
    item: ItemData,
    param: {
        image: string,
        classMap: { [k: string]: string },
        showAction: (name: string) => boolean,
        sort: (part: number) => any,
        action: (name: string) => any
    }
}) => {
    const { item, param } = p
    const { image, classMap, showAction, sort, action } = param
    const dispatch = useDispatch()
    const sortBy = (part: number) => () => dispatch(sort(part))

    return (
        <tr>
            <td className={classMap[item.n]} onClick={sortBy(NAME)}>{item.n}
                {showAction(item.n) ?
                    <img src={image} onClick={(e) => {
                        e.stopPropagation()
                        dispatch(action(item.n))
                    }}></img> : <></>
                }</td>
            <td onClick={sortBy(QUANTITY)}>{item.q}</td>
            <td onClick={sortBy(VALUE)}>{item.v + ' PED'}</td>
        </tr>
    )
}

const TradeList = (p: {
    title: string,
    list: InventoryList<ItemData>,
    setExpanded: (expanded: boolean) => any,
    image: string,
    classMap: { [k: string]: string },
    showAction: (name: string) => boolean,
    sort: (part: number) => any,
    action: (name: string) => any
}) => {
    let { title, list, setExpanded } = p
    return (
        <>
            <ExpandableSection title={title} expanded={list.expanded} setExpanded={setExpanded}>
                <p>Total value {list.stats.ped} PED for {list.stats.count} items</p>
                <table className='table-diff'>
                    <tbody>
                        {
                            list.items.map((item: ItemData) =>
                                <ItemRow
                                    key={item.id}
                                    item={item}
                                    param={p} />
                            )
                        }
                    </tbody>
                </table>
            </ExpandableSection>
        </>
    )
}

export default TradeList