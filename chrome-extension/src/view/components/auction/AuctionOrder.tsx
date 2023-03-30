import React from 'react'
import { useSelector } from 'react-redux'
import { markupChanged, valueChanged } from '../../application/actions/order'
import { addOrderToSheet } from '../../application/actions/sheets'
import { MATERIAL_NX } from '../../application/helpers/materials'
import { getOrder } from '../../application/selectors/order'
import { sheetPendingOrder } from '../../application/selectors/sheets'
import { OrderState } from '../../application/state/order'
import AuctionButton from './AuctionButton'
import AuctionInput from './AuctionInput'

function AuctionOrder() {
    const s: OrderState = useSelector(getOrder)
    const pending: boolean = useSelector(sheetPendingOrder(MATERIAL_NX))

    return (
        <section>
            <h1>Order Nexus</h1>
            <form>
                <AuctionInput
                    label='Markup'
                    value={s.markup}
                    unit='%'
                    getChangeAction={markupChanged} />

                <AuctionInput
                    label='Value'
                    value={s.value}
                    unit='PED'
                    getChangeAction={valueChanged} />
            </form>
            <AuctionButton title='Order' pending={pending} action={addOrderToSheet(MATERIAL_NX, s.markup, s.value)} />
        </section>
    )
}

export default AuctionOrder
