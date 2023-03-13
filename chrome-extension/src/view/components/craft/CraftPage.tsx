import React from 'react'
import CraftChooser from './CraftChooser'
import CraftCollapsedList from './CraftCollapsedList'
import CraftExpandedList from './CraftExpandedList'

function CraftPage() {
    return (
        <>
            <CraftExpandedList />
            <CraftCollapsedList />
            <CraftChooser />
        </>
    )
}

export default CraftPage
