import React from 'react'
import ListStorage from '../../../background/listStorage'
import { ItemData } from '../../../common/state'
import { CONTAINER, NAME, QUANTITY, VALUE } from '../../application/helpers/sort'
import { InventoryList } from '../../application/state/inventory'
import ExpandableSection from '../common/ExpandableSection'

interface Config {
    sortBy: (part: number) => () => void
    move: (name: string) => void
    image: string,
    setExpanded: (expanded: boolean) => any
}

const ItemRow = (p: {
    item: ItemData,
    c: Config
}) => {
    const { item, c } = p
    return (
        <tr>
            <td onClick={c.sortBy(NAME)}>
                <img src={c.image} onClick={(e) => {
                    e.stopPropagation()
                    c.move(item.n)
                }} />
                {item.n}
            </td>
            <td onClick={c.sortBy(QUANTITY)}>{item.q}</td>
            <td onClick={c.sortBy(VALUE)}>{item.v + ' PED'}</td>
            <td onClick={c.sortBy(CONTAINER)}>{item.c}</td>
        </tr>
    )
}

const InventoryList = (p: {
    title: string,
    list: InventoryList,
    config: Config
}) => {
    return (
        <>
            <ExpandableSection title={p.title} expanded={p.list.expanded} setExpanded={p.config.setExpanded}>
                <table className='table-diff'>
                    <tbody>
                        {
                            p.list.items.map((item: ItemData) =>
                                <ItemRow
                                    key={item.id}
                                    item={item}
                                    c={p.config} />
                            )
                        }
                    </tbody>
                </table>
            </ExpandableSection>
        </>
    )
}

export default InventoryList