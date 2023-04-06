import React from 'react'
import AuctionInput from './AuctionInput'
import AuctionOutput from './AuctionOutput'
import { CalculatorStateIn1, CalculatorStateOut1 } from '../../application/state/calculator'
import { sheetPendingAuction } from '../../application/selectors/sheets'
import { addAuctionToSheet } from '../../application/actions/sheets'
import { useSelector } from 'react-redux'

function AuctionCalcOne(p: {
    material: string,
    markupAction: (markup: string) => any
    valueAction: (value: string) => any
    inn: CalculatorStateIn1,
    out: CalculatorStateOut1
}) {
    const { material, markupAction, valueAction, inn, out } = p
    const pending = useSelector(sheetPendingAuction(material))
    return (
        <section>
            <h1>{material}</h1>
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
                pending={pending}
                sellAction={addAuctionToSheet(material, out)}
            />
        </section>
    )
}

export default AuctionCalcOne
