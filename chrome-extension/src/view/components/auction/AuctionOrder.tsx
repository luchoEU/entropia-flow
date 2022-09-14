import React from 'react'
import { useSelector } from 'react-redux'
import { addOrderToSheet, markupChanged, valueChanged } from '../../application/actions/order'
import { getOrder } from '../../application/selectors/order'
import { OrderState } from '../../application/state/order'
import AuctionButton from './AuctionButton'
import AuctionInput from './AuctionInput'

function AuctionOrder() {
    const s: OrderState = useSelector(getOrder)

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
            <AuctionButton title='Order' pending={s.pending} action={addOrderToSheet(s.markup, s.value)} />
        </section>
    )
}

export default AuctionOrder
