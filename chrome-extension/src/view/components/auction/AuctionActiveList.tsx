import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { removeActive, soldActive } from '../../application/actions/actives'
import { getActiveList, getLoading } from '../../application/selectors/actives'
import { ACTIVES_ITEM, ACTIVES_LOADING_STATE, OPERATION_NONE } from '../../application/state/actives'
import AuctionButton from './AuctionButton'

function AuctionActiveItem(p: { item: ACTIVES_ITEM }) {
    const dispatch = useDispatch()
    const loading: ACTIVES_LOADING_STATE = useSelector(getLoading)

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
            <td>{
                item.operation === OPERATION_NONE ? '' :
                    <AuctionButton title='Sell' pending={item.pending} action={soldActive(item.date)} />
            }</td>
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
                    list.map((item: ACTIVES_ITEM) =>
                        <AuctionActiveItem key={item.date} item={item} />)
                }
            </tbody>
        </table>
    )
}

export default AuctionActiveList
