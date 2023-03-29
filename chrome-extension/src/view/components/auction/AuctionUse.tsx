import React from 'react'
import { useSelector } from 'react-redux'
import { addUseToSheet } from '../../application/actions/sheets'
import { useAmountChanged } from '../../application/actions/use'
import { useTitle } from '../../application/helpers/use'
import { sheetPendingUse } from '../../application/selectors/sheets'
import { getOneUse } from '../../application/selectors/use'
import { UseOneState } from '../../application/state/use'
import AuctionButton from './AuctionButton'
import AuctionInput from './AuctionInput'

function AuctionUse({ material }) {
    const s: UseOneState = useSelector(getOneUse(material))
    const pending: boolean = useSelector(sheetPendingUse(material))

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
            <AuctionButton title='Use' pending={pending} action={addUseToSheet(material, s.amount)} />
        </section>
    )
}

export default AuctionUse
