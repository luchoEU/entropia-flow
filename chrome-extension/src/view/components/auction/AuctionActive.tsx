import React from 'react'
import AuctionActiveList from './AuctionActiveList'
import AuctionLoading from './AuctionLoading'

function AuctionActive() {
    return (
        <section>
            <h1>Actives</h1>
            <AuctionActiveList />
            <AuctionLoading />
        </section>
    )
}

export default AuctionActive
