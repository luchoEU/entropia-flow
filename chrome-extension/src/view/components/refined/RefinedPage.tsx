import React from 'react'
import { useAtomValue } from 'jotai'
import { refinedMapAtom } from '../../application/atoms/refined'
import { RefinedState } from '../../application/state/refined'
import RefinedMaterial from './RefinedMaterial'
import RefinedActive from './RefinedActive'

function RefinedPage() {
    const state: RefinedState = useAtomValue(refinedMapAtom)

    return (
        <>
            <RefinedActive />
            <div className='flex'>
                { Object.keys(state.map).map(name =>
                    <RefinedMaterial key={name} material={state.map[name]} />
                )}
            </div>
        </>
    )
}

export default RefinedPage