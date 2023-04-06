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
                material={MATERIAL_ME}
                markupAction={meMarkupChanged}
                valueAction={meValueChanged}
                inn={c.in.me}
                out={c.out.me}
            />
            <AuctionCalcOne
                material={MATERIAL_LME}
                markupAction={lmeMarkupChanged}
                valueAction={lmeValueChanged}
                inn={c.in.lme}
                out={c.out.lme}
            />
            <AuctionCalcOne
                material={MATERIAL_NB}
                markupAction={nbMarkupChanged}
                valueAction={nbValueChanged}
                inn={c.in.nb}
                out={c.out.nb}
            />
        </>
    )
}

export default AuctionCalculator
