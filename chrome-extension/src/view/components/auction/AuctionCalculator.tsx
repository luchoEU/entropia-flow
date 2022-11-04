import React from 'react'
import { useSelector } from 'react-redux'
import { lmeMarkupChanged, lmeSell, lmeValueChanged, meMarkupChanged, meSell, meValueChanged, nbMarkupChanged, nbSell, nbValueChanged } from '../../application/actions/calculator'
import { getCalculator } from '../../application/selectors/calculator'
import { CalculatorState } from '../../application/state/calculator'
import AuctionCalcOne from './AuctionCalcOne'
import AuctionMaterials from './AuctionMaterials'

function AuctionCalculator() {
    const c: CalculatorState = useSelector(getCalculator)

    return (
        <>
            <div>
                <AuctionMaterials />
            </div>
            <AuctionCalcOne
                title='Mind Essence'
                markupAction={meMarkupChanged}
                valueAction={meValueChanged}
                sellAction={meSell}
                inn={c.in.me}
                out={c.out.me}
            />
            <AuctionCalcOne
                title='Light Mind Essence'
                markupAction={lmeMarkupChanged}
                valueAction={lmeValueChanged}
                sellAction={lmeSell}
                inn={c.in.lme}
                out={c.out.lme}
            />
            <AuctionCalcOne
                title='Nutrio Bar'
                markupAction={nbMarkupChanged}
                valueAction={nbValueChanged}
                sellAction={nbSell}
                inn={c.in.nb}
                out={c.out.nb}
            />
        </>
    )
}

export default AuctionCalculator
