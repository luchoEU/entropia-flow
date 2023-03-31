import React from 'react'
import { useSelector } from 'react-redux'
import { refineAmountChanged } from '../../application/actions/refine'
import { addRefineToSheet } from '../../application/actions/sheets'
import { getOneRefine } from '../../application/selectors/refine'
import { sheetPendingRefine } from '../../application/selectors/sheets'
import { RefineOneState } from '../../application/state/refine'
import AuctionButton from './AuctionButton'
import AuctionInput from './AuctionInput'

function AuctionRefine(p: { material: string }) {
    const { material } = p
    const s: RefineOneState = useSelector(getOneRefine(material))
    const pending: boolean = useSelector(sheetPendingRefine(material))

    return (
        <section>
            <h1>Refine {material}</h1>
            <form>
                <AuctionInput
                    label='Nexus Amount'
                    value={s.amount}
                    unit=''
                    getChangeAction={refineAmountChanged(material)} />
            </form>
            <AuctionButton title='Refine' pending={pending} action={addRefineToSheet(material, s.amount)} />
        </section>
    )
}

export default AuctionRefine
