import React from 'react'
import { useSelector } from 'react-redux'
import { addSweatToSheet } from '../../application/actions/sheets'
import { sweatAmountChanged, sweatPriceChanged } from '../../application/actions/sweat'
import { MATERIAL_SW } from '../../application/helpers/materials'
import { sheetPendingBuy } from '../../application/selectors/sheets'
import { getSweat } from '../../application/selectors/sweat'
import { SweatState } from '../../application/state/sweat'
import AuctionButton from './AuctionButton'
import AuctionInput from './AuctionInput'

function AuctionSweat() {
    const s: SweatState = useSelector(getSweat)
    const pending: boolean = useSelector(sheetPendingBuy(MATERIAL_SW))

    return (
        <section>
            <h1>Buy Sweat</h1>
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
                <AuctionButton title='Buy' pending={pending} action={addSweatToSheet(s.in.price, s.in.amount)} />
            </div>
        </section>
    )
}

export default AuctionSweat
