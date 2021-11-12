import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getLoading } from '../../application/selectors/actives'
import { ACTIVES_LOADING_STATE } from '../../application/state/actives'
import { CalculatorStateOut1 } from '../../application/state/calculator'
import AuctionButton from './AuctionButton'

function AuctionOutput(c: {
    out: CalculatorStateOut1,
    sellAction: { type: string }
}) {
    return (
        <div className='grid-output'>
            <div className='calc-output main-output'>
                <div>Sell Amount</div>
                <div>{c.out.amount}</div>

                <div>Opening Bid</div>
                <div>{c.out.openingValue}</div>

                <div>Buyout Bid</div>
                <div>{c.out.buyoutValue}</div>
            </div>

            <AuctionButton title='Sell' action={c.sellAction} />

            <div className='calc-output'>
                <div>Auction Fee</div>
                <div>{c.out.openingFee}</div>

                <div>Buyout Fee</div>
                <div>{c.out.buyoutFee}</div>

                <div>Profit Sale</div>
                <div>{c.out.profitSale}</div>

                <div>Profit x 1k</div>
                <div>{c.out.profitK}</div>

                <div>Total Cost</div>
                <div>{c.out.cost}</div>
            </div>
        </div>
    )
}

export default AuctionOutput
