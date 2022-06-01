import React from 'react'
import AuctionInput from './AuctionInput'
import AuctionOutput from './AuctionOutput'

function AuctionCalcOne({ title, markupValue, markupAction, valueValue, valueAction, pending, sellAction, out }) {
    return (
        <section>
            <h1>{title}</h1>
            <form>
                <AuctionInput
                    label='Markup'
                    value={markupValue}
                    unit='%'
                    getChangeAction={markupAction} />

                <AuctionInput
                    label='Value'
                    value={valueValue}
                    unit='PED'
                    getChangeAction={valueAction} />
            </form>
            <AuctionOutput
                out={out}
                pending={pending}
                sellAction={sellAction} />
        </section>
    )
}

export default AuctionCalcOne
