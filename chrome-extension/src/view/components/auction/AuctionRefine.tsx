import React from 'react'
import { useSelector } from 'react-redux'
import { addRefineToSheet, refineAmountChanged } from '../../application/actions/refine'
import { refineTitle } from '../../application/helpers/refine'
import { getOneRefine } from '../../application/selectors/refine'
import { RefineOneState } from '../../application/state/refine'
import AuctionButton from './AuctionButton'
import AuctionInput from './AuctionInput'

function AuctionRefine({ material }) {
    const s: RefineOneState = useSelector(getOneRefine(material))

    return (
        <section>
            <h1>Refine {refineTitle[material]}</h1>
            <form>
                <AuctionInput
                    label='Nexus Amount'
                    value={s.amount}
                    unit=''
                    getChangeAction={refineAmountChanged(material)} />
            </form>
            <AuctionButton title='Refine' pending={s.pending} action={addRefineToSheet(material, s.amount)} />
        </section>
    )
}

export default AuctionRefine
