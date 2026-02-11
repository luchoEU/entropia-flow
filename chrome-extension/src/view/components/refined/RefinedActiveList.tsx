import React, { useCallback } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { removeActiveAtom, activesAtom } from '../../application/atoms/actives'
import { addSheetsPendingChangeAtom, sheetsAtom } from '../../application/atoms/sheets'
import { ActivesItem, ActivesLoadingState } from '../../application/state/actives'
import { OPERATION_TYPE_REFINED_SOLD_ACTIVE } from '../../application/state/sheets'
import { BudgetLineData } from '../../services/api/sheets/sheetsBudget'
import RefinedButton from './RefinedButton'
import ImgButton from '../common/ImgButton'

function RefinedActiveItem(p: { item: ActivesItem }) {
    const loading: ActivesLoadingState = useAtomValue(activesAtom).loading
    const addPendingChange = useSetAtom(addSheetsPendingChangeAtom)
    const removeActive = useSetAtom(removeActiveAtom)

    const item = p.item

    // Check if there's a pending change for this item
    const sheets = useAtomValue(sheetsAtom)
    const pending: boolean = sheets.pending.some((p: any) => p.date === item.date && p.operationType === OPERATION_TYPE_REFINED_SOLD_ACTIVE)

    const handleSell = useCallback(() => {
        const line: BudgetLineData = {
            date: item.date,
            reason: 'Sold',
            ped: Number(item.buyout) - Number(item.buyoutFee) + Number(item.openingFee),
            materials: [
                {
                    name: item.material,
                    quantity: -Number(item.quantity)
                }
            ]
        }
        addPendingChange(
            OPERATION_TYPE_REFINED_SOLD_ACTIVE,
            item.date,
            item.material,
            [line],
            [item.date]
        )
    }, [item, addPendingChange])

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
            <td><RefinedButton title='Sell' pending={pending} onClick={handleSell} /></td>
            <td>{ loading === undefined &&
                <ImgButton title='Remove' src='img/cross.png' action={() => { removeActive(item.date); return true }} />
            }</td>
        </tr >
    )
}

function RefinedActiveList() {
    const { list } = useAtomValue(activesAtom)

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
