import React, { useState } from 'react'
import { CONTAINER, NAME, QUANTITY, VALUE } from '../../application/helpers/inventorySort'
import { MindEssenceLogText, ViewItemData } from '../../application/state/history'
import { hasValue } from '../../application/helpers/diff'
import { useDispatch } from 'react-redux'
import { AUCTION_PAGE, selectMenu } from '../../application/actions/menu'
import { ViewPedData } from '../../application/state/last'
import { addPeds, removePeds } from '../../application/actions/last'

interface Config {
    sortBy: (part: number) => () => void
    allowExclude: boolean
    include?: (key: number) => void
    exclude?: (key: number) => void
    permanentExcludeOn?: (key: number) => void
    permanentExcludeOff?: (key: number) => void
    showPeds: boolean
    movedTitle: string
}

const ItemRow = (p: {
    item: ViewItemData,
    c: Config
}) => {
    const { item, c } = p
    const dispatch = useDispatch()
    return (
        <tr>
            <td onClick={c.sortBy(NAME)}>{item.n}
                {item.w ? <img data-show src='img/warning.png' onClick={(e) => {
                    e.stopPropagation()
                    c.exclude(item.key)
                }} /> : ''}
                {
                    c.allowExclude && hasValue(item) ?
                        (item.e ?
                            (item.x ?
                                <img src='img/forbidden.png' data-show onClick={(e) => {
                                    e.stopPropagation()
                                    c.permanentExcludeOff(item.key)
                                }}></img> :
                                <>
                                    <img src='img/cross.png' data-show onClick={(e) => {
                                        e.stopPropagation()
                                        c.include(item.key)
                                    }}></img>
                                    <img src='img/forbidden.png' onClick={(e) => {
                                        e.stopPropagation()
                                        c.permanentExcludeOn(item.key)
                                    }}></img>
                                </>
                             ) :
                            <img src='img/tick.png' onClick={(e) => {
                                e.stopPropagation()
                                c.exclude(item.key)
                            }}></img>) :
                        ''
                }
            </td>
            <td onClick={c.sortBy(QUANTITY)}>{item.q}</td>
            <td onClick={c.sortBy(VALUE)}
                title={item.v.includes('(') ? c.movedTitle : ''}>
                {item.v === '' ? '' : item.v + ' PED'}
            </td>
            <td onClick={c.sortBy(CONTAINER)}>{item.c}</td>
            <td>
                {item.a ?
                    <button
                        className='button-me-log'
                        onClick={() => dispatch(selectMenu(AUCTION_PAGE))}>
                        {MindEssenceLogText[item.a.type]}
                    </button>
                    : ''}
            </td>
        </tr>
    )
}

const PedRow = (p: {
    item: ViewPedData,
    c: Config
}) => {
    const { item, c } = p
    const dispatch = useDispatch()
    return (
        <tr>
            <td>PED
                <img src='img/cross.png' onClick={() => { dispatch(removePeds(item.key)) }}></img>
            </td>
            <td></td>
            <td>{item.value + ' PED'}</td>
            <td></td>
            <td></td>
        </tr >
    )
}

const PedNewRow = () => {
    const dispatch = useDispatch()
    const [peds, setPeds] = useState('')
    const isValid = !isNaN(Number(peds)) && Number(peds) !== 0
    return (
        <tr>
            <td>PED
                {isValid ?
                    <img src='img/tick.png' data-show onClick={() => {
                        dispatch(addPeds(peds))
                        setPeds('')
                    }}></img> : <></>
                }
            </td>
            <td></td>
            <td>
                <input id='newPedInput' type='text' value={peds} onChange={(e) => setPeds(e.target.value)} />
            </td>
            <td></td>
            <td></td>
        </tr >
    )
}

const InventoryDifference = (p: {
    diff: Array<ViewItemData>,
    peds: Array<ViewPedData>,
    config: Config
}) => {
    if (p.diff == undefined)
        return (<></>)

    return (
        <table className='table-diff'>
            <tbody>
                {
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
                            item={item}
                            c={p.config} />
                    )
                }
                {p.config.showPeds ? <PedNewRow key='0' /> : <></>}
            </tbody>
        </table>
    )
}

export default InventoryDifference