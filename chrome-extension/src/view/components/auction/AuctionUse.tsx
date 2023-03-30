import React from 'react'
import { useSelector } from 'react-redux'
import { addUseToSheet } from '../../application/actions/sheets'
import { useAmountChanged } from '../../application/actions/use'
import { useTitle } from '../../application/helpers/use'
import { getCalculatorOut } from '../../application/selectors/calculator'
import { sheetPendingUse } from '../../application/selectors/sheets'
import { getOneUse } from '../../application/selectors/use'
import { CalculatorStateOut1 } from '../../application/state/calculator'
import { UseOneState } from '../../application/state/use'
import AuctionButton from './AuctionButton'
import AuctionInput from './AuctionInput'

function AuctionUse({ material }) {
    const s: UseOneState = useSelector(getOneUse(material))
    const pending: boolean = useSelector(sheetPendingUse(material))
    const c: CalculatorStateOut1 = useSelector(getCalculatorOut(material))

    return (
        <section>
            <h1>Use {useTitle[material]}</h1>
            <form>
                <AuctionInput
                    label='Nexus Amount'
                    value={s.amount}
                    unit=''
                    getChangeAction={useAmountChanged(material)} />
            </form>
            <AuctionButton title='Use' pending={pending} action={addUseToSheet(material, s.amount, c.cost)} />
        </section>
    )
}

export default AuctionUse
