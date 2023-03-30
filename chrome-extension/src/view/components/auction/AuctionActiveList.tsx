import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { removeActive } from '../../application/actions/actives'
import { soldActiveToSheet } from '../../application/actions/sheets'
import { getActiveList, getLoading } from '../../application/selectors/actives'
import { getSheets, sheetPendingOrder, sheetPendingSoldActive } from '../../application/selectors/sheets'
import { ActivesItem, ActivesLoadingState } from '../../application/state/actives'
import { SheetsState } from '../../application/state/sheets'
import AuctionButton from './AuctionButton'

function AuctionActiveItem(p: { item: ActivesItem }) {
    const dispatch = useDispatch()
    const loading: ActivesLoadingState = useSelector(getLoading)
    const t: SheetsState = useSelector(getSheets)
    const pending: boolean = useSelector(sheetPendingSoldActive(p.item.date))

    const item = p.item
    const date = new Date()
    date.setTime(item.date)
    const dateStr = date.toString().slice(0, 24)
    return (
        <tr>
            <td>{dateStr}</td>
            <td>{item.type}</td>
            <td>{item.quantity}</td>
            <td>{item.opening}</td>
            <td>{item.buyout}</td>
            <td><AuctionButton title='Sell' pending={pending} action={soldActiveToSheet(item.date)} /></td>
            <td>{
                loading === undefined ?
                    <img src='img/cross.png' onClick={() => dispatch(removeActive(item.date))}></img>
                    : ''
            }</td>
        </tr >
    )
}

function AuctionActiveList() {
    const list = useSelector(getActiveList)

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
                        <AuctionActiveItem key={item.date} item={item} />)
                }
            </tbody>
        </table>
    )
}

export default AuctionActiveList
