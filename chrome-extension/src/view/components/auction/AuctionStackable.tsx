import React from 'react'
import { useSelector } from 'react-redux'
import { addStackableToSheet } from '../../application/actions/sheets'
import { stackableMarkupChanged, stackableTTValueChanged } from '../../application/actions/stackable'
import { sheetPendingBuyStackable } from '../../application/selectors/sheets'
import { getOneStackableIn, getOneStackableOut } from '../../application/selectors/stackable'
import { StackableOneStateIn, StackableOneStateOut } from '../../application/state/stackable'
import AuctionButton from './AuctionButton'
import AuctionInput from './AuctionInput'

function AuctionStackable(p: { material: string }) {
    const { material } = p
    const sin: StackableOneStateIn = useSelector(getOneStackableIn(material))
    const sout: StackableOneStateOut = useSelector(getOneStackableOut(material))
    const pending: boolean = useSelector(sheetPendingBuyStackable(material))

    return (
        <section>
            <h1>Buy {material}</h1>
            <form>
                <AuctionInput
                    label='TT'
                    value={sin.ttValue}
                    unit='PED'
                    getChangeAction={stackableTTValueChanged(material)} />

                <AuctionInput
                    label='Markup'
                    value={sin.markup}
                    unit=''
                    getChangeAction={stackableMarkupChanged(material)} />
            </form>
            <div className='grid-output'>
                <div className='calc-output main-output'>
                    <div>Value</div>
                    <div>{sout.value}</div>
                </div>
                <AuctionButton title='Buy' pending={pending} action={addStackableToSheet(material, sin.ttValue, sin.markup)} />
            </div>
        </section>
    )
}

export default AuctionStackable
