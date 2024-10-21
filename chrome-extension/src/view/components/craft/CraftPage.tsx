import React from 'react'
import CraftChooser from './CraftChooser'
import CraftCollapsedList from './CraftCollapsedList'
import CraftExpandedList from './CraftExpandedList'

function CraftPage() {
    return <>
        <CraftCollapsedList />
        <CraftExpandedList />
        <CraftChooser />
    </>
}

export default CraftPage
