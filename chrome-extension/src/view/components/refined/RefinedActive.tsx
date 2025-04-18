import React from 'react'
import RefinedActiveList from './RefinedActiveList'
import RefinedStatus from './RefinedStatus'
import { useSelector } from 'react-redux'
import { getActiveList } from '../../application/selectors/actives'
import { ActivesItem } from '../../application/state/actives'
import ExpandableSection from '../common/ExpandableSection2'

function RefinedActive() {
    const list: ActivesItem[] = useSelector(getActiveList)

    if (list === undefined || list.length === 0) {
        return <RefinedStatus />
    } else {
        return (
            <ExpandableSection selector='refined-active' title='Actives' subtitle='Refined sells active on auction'>
                <RefinedActiveList />
                <RefinedStatus />
            </ExpandableSection>
        )
    }
}

export default RefinedActive
