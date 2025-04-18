import React from 'react'
import { useParams } from 'react-router-dom'
import { formatUrlToBlueprint } from '../../application/helpers/navigation'
import CraftBlueprint from './CraftBlueprint'
import CraftFavoriteList from './CraftFavoriteList'
import CraftOwnedList from './CraftOwnedList'

function CraftPage() {
    const { bpName } = useParams()
    const bpNameDecoded = formatUrlToBlueprint(bpName)

    return bpNameDecoded ?
        <CraftBlueprint bpName={bpNameDecoded} /> :
        <>
            <CraftFavoriteList />
            <CraftOwnedList />
        </>
}

export default CraftPage
