import React from 'react'
import { useSelector } from 'react-redux'
import { fruitAmountChanged, fruitPriceChanged } from '../../application/actions/fruit'
import { addBuyPerKToSheet } from '../../application/actions/sheets'
import { MATERIAL_FT } from '../../application/helpers/materials'
import { getFruit } from '../../application/selectors/fruit'
import { sheetPendingBuyPerK } from '../../application/selectors/sheets'
import { FruitState } from '../../application/state/fruit'
import AuctionButton from './AuctionButton'
import AuctionInput from './AuctionInput'

function AuctionFruit() {
    const s: FruitState = useSelector(getFruit)
    const pending: boolean = useSelector(sheetPendingBuyPerK(MATERIAL_FT))

    return (
        <section>
            <h1>Buy Fruit</h1>
            <form>
                <AuctionInput
                    label='Price'
                    value={s.in.price}
                    unit='PED/k'
                    getChangeAction={fruitPriceChanged} />

                <AuctionInput
                    label='Amount'
                    value={s.in.amount}
                    unit=''
                    getChangeAction={fruitAmountChanged} />
            </form>
            <div className='grid-output'>
                <div className='calc-output main-output'>
                    <div>Value</div>
                    <div>{s.out.value}</div>
                </div>
                <AuctionButton title='Buy' pending={pending} action={addBuyPerKToSheet(MATERIAL_FT, s.in.price, s.in.amount)} />
            </div>
        </section>
    )
}

export default AuctionFruit
