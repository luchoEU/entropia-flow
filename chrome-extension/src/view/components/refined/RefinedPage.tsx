import React from 'react'
import { useSelector } from 'react-redux'
import { getRefined } from '../../application/selectors/refined'
import { RefinedState } from '../../application/state/refined'
import RefinedMaterial from './RefinedMaterial'
import RefinedActive from './RefinedActive'

function RefinedPage() {
    const state: RefinedState = useSelector(getRefined)

    return (
        <>
            <RefinedActive />
            { Object.keys(state.map).map(name =>
                <div key={name} className='flex'>
                    <RefinedMaterial material={state.map[name]} />
                </div>
            )}
        </>
    )
}

export default RefinedPage