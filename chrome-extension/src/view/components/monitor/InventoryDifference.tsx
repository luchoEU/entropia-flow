import React, { useState } from 'react'
import { CONTAINER, NAME, QUANTITY, VALUE } from '../../application/helpers/inventory.sort'
import { ViewItemData } from '../../application/state/history'
import { hasValue } from '../../application/helpers/diff'
import { useDispatch } from 'react-redux'
import { selectForAction } from '../../application/actions/menu'
import { ViewPedData } from '../../application/state/last'
import { addPeds, removePeds } from '../../application/actions/last'
import ImgButton from '../common/ImgButton'
import ItemText from '../common/ItemText'

interface Config {
    sortBy: (part: number) => any
    allowExclude: boolean
    include?: (key: number) => any
    exclude?: (key: number) => any
    permanentExcludeOn?: (key: number) => any
    permanentExcludeOff?: (key: number) => any
    showPeds: boolean
    movedTitle: string
}

const ItemRow = (p: {
    item: ViewItemData,
    c: Config
}) => {
    const { item, c } = p
    const dispatch = useDispatch()
    const sortBy = (part: number) => (e: any) => {
        e.stopPropagation()
        dispatch(c.sortBy(part))
    }

    return (
        <tr className='item-row'>
            <td onClick={sortBy(NAME)}>
                <ItemText text={item.n} />
                { item.w &&
                    <ImgButton title='There is already a similar item excluded from the sum' show src='img/warning.png' dispatch={() => c.exclude(item.key)} />
                }
            </td>
            <td>
                {
                    c.allowExclude && hasValue(item) &&
                        (item.e ?
                            (item.x ?
                                <ImgButton title='Remove permanently exclusion from the sum' src='img/forbidden.png' show dispatch={() => c.permanentExcludeOff(item.key)} /> :
                                <>
                                    <ImgButton title='This item is currently excluded from the sum, click to include it again' src='img/cross.png' show dispatch={() => c.include(item.key)} />
                                    <ImgButton title='Permanently exclude this item from the sum' src='img/forbidden.png' dispatch={() => c.permanentExcludeOn(item.key)} />
                                </>
                            ) :
                            <ImgButton title='Exclude this item from the sum' src='img/cross.png' dispatch={() => c.exclude(item.key)} />
                        )
                }
            </td>
            <td onClick={sortBy(QUANTITY)}>
                <ItemText text={item.q} />
            </td>
            <td onClick={sortBy(VALUE)}
                title={item.v.includes('(') ? c.movedTitle : ''}>
                <ItemText text={item.v === '' ? '' : item.v + ' PED'} />
            </td>
            <td onClick={sortBy(CONTAINER)}>
                <ItemText text={item.c} />
            </td>
            <td>
                { item.a &&
                    <button
                        className='button-me-log'
                        onClick={(e) => {
                            e.stopPropagation()
                            dispatch(selectForAction(item.a.menu, item.n))
                        }}>
                        { '>' }
                    </button>
                }
            </td>
        </tr>
    )
}

const PedRow = (p: {
    item: ViewPedData
}) => {
    const { item } = p
    return (
        <tr>
            <td>
                <ItemText text={'PED'} />
            </td>
            <td>
                <ImgButton title='Remove PEDs' src='img/cross.png' dispatch={() => removePeds(item.key)} />
            </td>
            <td></td>
            <td>
                <ItemText text={item.value + ' PED'} />
            </td>
            <td></td>
            <td></td>
        </tr >
    )
}

const PedNewRow = () => {
    const [peds, setPeds] = useState('')
    const isValid = !isNaN(Number(peds)) && Number(peds) !== 0
    return (
        <tr>
            <td>PED</td>
            <td></td>
            <td></td>
            <td>
                <input id='newPedInput' type='text' value={peds} onChange={(e) => setPeds(e.target.value)} />
            </td>
            <td>
                { peds && (isValid ?
                    <ImgButton
                        title='Add PEDs'
                        src='img/tick.png' show dispatch={() => {
                        setPeds('')
                        return addPeds(peds)
                    }} /> : <ImgButton
                        title='Cancel'
                        src='img/cross.png' show dispatch={() => {
                        setPeds('')
                        return undefined
                    }} />)
                }
            </td>
            <td></td>
        </tr >
    )
}

const InventoryDifference = (p: {
    diff: Array<ViewItemData>,
    peds: Array<ViewPedData>,
    config: Config
}) => {
    return (
        <table className='table-diff'>
            <tbody>
                { p.diff &&
                    p.diff.map((item: ViewItemData) =>
                        <ItemRow
                            key={item.key}
                            item={item}
                            c={p.config} />
                    )
                }
                {
                    p.peds.map((item: ViewPedData) =>
                        <PedRow
                            key={item.key}
                            item={item} />
                    )
                }
                { p.config.showPeds && <PedNewRow key='0' /> }
            </tbody>
        </table>
    )
}

export default InventoryDifference