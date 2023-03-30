import React from 'react'
import { useSelector } from 'react-redux'
import { lmeMarkupChanged, lmeValueChanged, meMarkupChanged, meValueChanged, nbMarkupChanged, nbValueChanged } from '../../application/actions/calculator'
import { addAuctionToSheet } from '../../application/actions/sheets'
import { MATERIAL_LME, MATERIAL_ME, MATERIAL_NB } from '../../application/helpers/materials'
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
                sellAction={addAuctionToSheet(MATERIAL_ME, c.out.me)}
                inn={c.in.me}
                out={c.out.me}
            />
            <AuctionCalcOne
                title='Light Mind Essence'
                markupAction={lmeMarkupChanged}
                valueAction={lmeValueChanged}
                sellAction={addAuctionToSheet(MATERIAL_LME, c.out.lme)}
                inn={c.in.lme}
                out={c.out.lme}
            />
            <AuctionCalcOne
                title='Nutrio Bar'
                markupAction={nbMarkupChanged}
                valueAction={nbValueChanged}
                sellAction={addAuctionToSheet(MATERIAL_NB, c.out.nb)}
                inn={c.in.nb}
                out={c.out.nb}
            />
        </>
    )
}

export default AuctionCalculator
