import React from 'react'
import CraftChooser from './CraftChooser'
import CraftCollapsedList from './CraftCollapsedList'
import CraftExpandedList from './CraftExpandedList'
import CraftMaterialList from './CraftMaterialList'

function CraftPage() {
    return (
        <>
            <CraftExpandedList />
            <CraftCollapsedList />
            <CraftMaterialList />
            <CraftChooser />
        </>
    )
}

export default CraftPage
