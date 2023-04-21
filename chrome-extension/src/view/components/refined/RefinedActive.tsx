import React from 'react'
import RefinedActiveList from './RefinedActiveList'
import RefinedStatus from './RefinedStatus'
import { useSelector } from 'react-redux'
import { getActiveList } from '../../application/selectors/actives'
import { ActivesItem } from '../../application/state/actives'

function AuctionActive() {
    const list: ActivesItem[] = useSelector(getActiveList)

    if (list === undefined || list.length === 0) {
        return (<RefinedStatus />)
    } else {
        return (
            <section>
                <h1>Actives</h1>
                <RefinedActiveList />
                <RefinedStatus />
            </section>
        )
    }
}

export default AuctionActive
