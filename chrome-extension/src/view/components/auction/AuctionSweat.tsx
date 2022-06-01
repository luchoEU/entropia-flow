import React from 'react'
import { useSelector } from 'react-redux'
import { addSweatToSheet, sweatAmountChanged, sweatPriceChanged } from '../../application/actions/sweat'
import { getSweat } from '../../application/selectors/sweat'
import { SweatState } from '../../application/state/sweat'
import AuctionButton from './AuctionButton'
import AuctionInput from './AuctionInput'

function AuctionSweat() {
    const s: SweatState = useSelector(getSweat)

    return (
        <section>
            <h1>Sweat</h1>
            <form>
                <AuctionInput
                    label='Price'
                    value={s.in.price}
                    unit='PED/k'
                    getChangeAction={sweatPriceChanged} />

                <AuctionInput
                    label='Amount'
                    value={s.in.amount}
                    unit=''
                    getChangeAction={sweatAmountChanged} />
            </form>
            <div className='grid-output'>
                <div className='calc-output main-output'>
                    <div>Value</div>
                    <div>{s.out.value}</div>
                </div>
                <AuctionButton title='Buy' pending={s.in.pending} action={addSweatToSheet(s.in.price, s.in.amount)} />
            </div>
        </section>
    )
}

export default AuctionSweat
