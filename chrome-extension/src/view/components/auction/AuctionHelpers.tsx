import React from 'react'
import { newDay } from '../../application/actions/helpers'
import AuctionButton from './AuctionButton'

function AuctionHelpers() {
    return (
        <section>
            <h1>Helpers</h1>
            <AuctionButton title='New Day' action={newDay} />
        </section>
    )
}

export default AuctionHelpers
