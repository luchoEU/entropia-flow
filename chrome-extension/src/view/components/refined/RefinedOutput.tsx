import React from 'react'
import { RefinedCalculatorStateOut } from '../../application/state/refined'
import RefinedButton from './RefinedButton'

function RefinedOutput(c: {
    out: RefinedCalculatorStateOut,
    pending: boolean,
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

            <RefinedButton title='Sell' pending={c.pending} action={c.sellAction} />

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

export default RefinedOutput
