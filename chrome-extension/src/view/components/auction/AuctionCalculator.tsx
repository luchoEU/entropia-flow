import React from 'react'
import { useSelector } from 'react-redux'
import { lmeMarkupChanged, lmeSell, lmeValueChanged, meMarkupChanged, meSell, meValueChanged } from '../../application/actions/calculator'
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
                markupValue={c.in.meMarkup}
                markupAction={meMarkupChanged}
                valueValue={c.in.meValue}
                valueAction={meValueChanged}
                pending={c.in.mePending}
                sellAction={meSell}
                out={c.out.me}
            />
            <AuctionCalcOne
                title='Light Mind Essence'
                markupValue={c.in.lmeMarkup}
                markupAction={lmeMarkupChanged}
                valueValue={c.in.lmeValue}
                valueAction={lmeValueChanged}
                pending={c.in.lmePending}
                sellAction={lmeSell}
                out={c.out.lme}
            />
        </>
    )
}

export default AuctionCalculator
