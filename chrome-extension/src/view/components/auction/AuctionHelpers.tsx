import React from 'react'
import { newDay } from '../../application/actions/helpers'
import AuctionButton from './AuctionButton'

function AuctionHelpers() {
    return (
        <section>
            <h1>Helpers</h1>
            <AuctionButton title='New Day' pending={false} action={newDay} />
        </section>
    )
}

export default AuctionHelpers
