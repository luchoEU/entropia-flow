import React from 'react'
import CraftChooser from './CraftChooser'
import CraftCollapsedList from './CraftCollapsedList'
import CraftExpandedList from './CraftExpandedList'

function CraftPage() {
    return <>
        <div className='flex'>
            <CraftCollapsedList />
            <CraftExpandedList />
        </div>
        <CraftChooser />
    </>
}

export default CraftPage
