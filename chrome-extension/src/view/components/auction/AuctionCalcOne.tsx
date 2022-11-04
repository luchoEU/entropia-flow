import React from 'react'
import AuctionInput from './AuctionInput'
import AuctionOutput from './AuctionOutput'

function AuctionCalcOne({ title, markupAction, valueAction, sellAction, inn, out }) {
    return (
        <section>
            <h1>{title}</h1>
            <form>
                <AuctionInput
                    label='Markup'
                    value={inn.markup}
                    unit='%'
                    getChangeAction={markupAction} />

                <AuctionInput
                    label='Value'
                    value={inn.value}
                    unit='PED'
                    getChangeAction={valueAction} />
            </form>
            <AuctionOutput
                out={out}
                pending={inn.pending}
                sellAction={sellAction} />
        </section>
    )
}

export default AuctionCalcOne
