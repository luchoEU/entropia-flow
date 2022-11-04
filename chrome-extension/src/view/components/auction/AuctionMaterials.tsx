import React from 'react'
import { useSelector } from 'react-redux'
import { dilutedChanged, fruitChanged, nexusChanged, sweatChanged, sweetstuffChanged } from '../../application/actions/calculator'
import { getCalculator } from '../../application/selectors/calculator'
import { CalculatorState } from '../../application/state/calculator'
import AuctionInput from './AuctionInput'

function AuctionMaterials() {
    const c: CalculatorState = useSelector(getCalculator)

    return (
        <section>
            <h1>Materials</h1>
            <form>
                <AuctionInput
                    label='Sweat 1k'
                    value={c.in.sweat}
                    unit='PED'
                    getChangeAction={sweatChanged} />

                <AuctionInput
                    label='Fruit 1k'
                    value={c.in.fruit}
                    unit='PED'
                    getChangeAction={fruitChanged} />

                <AuctionInput
                    label='Force Nexus'
                    value={c.in.nexus}
                    unit='%'
                    getChangeAction={nexusChanged} />

                <AuctionInput
                    label='Diluted Sweat'
                    value={c.in.diluted}
                    unit='%'
                    getChangeAction={dilutedChanged} />

                <AuctionInput
                    label='Sweetstuff'
                    value={c.in.sweetstuff}
                    unit='%'
                    getChangeAction={sweetstuffChanged} />
            </form>
        </section>
    )
}

export default AuctionMaterials
