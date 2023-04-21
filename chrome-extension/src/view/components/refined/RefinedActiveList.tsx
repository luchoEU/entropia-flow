import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { removeActive } from '../../application/actions/actives'
import { getActiveList, getLoading } from '../../application/selectors/actives'
import { getSheets, sheetPendingRefinedSold } from '../../application/selectors/sheets'
import { ActivesItem, ActivesLoadingState } from '../../application/state/actives'
import { SheetsState } from '../../application/state/sheets'
import RefinedButton from './RefinedButton'
import { refinedSoldActive } from '../../application/actions/sheets'

function RefinedActiveItem(p: { item: ActivesItem }) {
    const dispatch = useDispatch()
    const loading: ActivesLoadingState = useSelector(getLoading)
    const t: SheetsState = useSelector(getSheets)
    const pending: boolean = useSelector(sheetPendingRefinedSold(p.item.date))

    const item = p.item
    const date = new Date()
    date.setTime(item.date)
    const dateStr = date.toString().slice(0, 24)
    return (
        <tr>
            <td>{dateStr}</td>
            <td>{item.title}</td>
            <td>{item.quantity}</td>
            <td>{item.opening}</td>
            <td>{item.buyout}</td>
            <td><RefinedButton title='Sell' pending={pending} action={refinedSoldActive(item)} /></td>
            <td>{
                loading === undefined ?
                    <img src='img/cross.png' onClick={() => dispatch(removeActive(0, item.date))}></img>
                    : ''
            }</td>
        </tr >
    )
}

function RefinedActiveList() {
    const list: ActivesItem[] = useSelector(getActiveList)

    if (list === undefined)
        return <></>

    return (
        <table className='actives'>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Opening</th>
                    <th>Buyout</th>
                </tr>
            </thead>
            <tbody>
                {
                    list.map((item: ActivesItem) =>
                        <RefinedActiveItem key={item.date} item={item} />)
                }
            </tbody>
        </table>
    )
}

export default RefinedActiveList
