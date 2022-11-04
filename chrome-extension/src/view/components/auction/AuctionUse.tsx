import React from 'react'
import { useSelector } from 'react-redux'
import { addUseToSheet, useAmountChanged } from '../../application/actions/use'
import { useTitle } from '../../application/helpers/use'
import { getOneUse } from '../../application/selectors/use'
import { UseOneState } from '../../application/state/use'
import AuctionButton from './AuctionButton'
import AuctionInput from './AuctionInput'

function AuctionUse({ material }) {
    const s: UseOneState = useSelector(getOneUse(material))

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
            <AuctionButton title='Use' pending={s.pending} action={addUseToSheet(material, s.amount)} />
        </section>
    )
}

export default AuctionUse
