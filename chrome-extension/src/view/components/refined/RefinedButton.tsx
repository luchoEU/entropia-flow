import React from 'react'
import { useAtomValue } from 'jotai'
import { activesAtom } from '../../application/atoms/actives'
import { ActivesLoadingState } from '../../application/state/actives'

function RefinedButton(p: {
    title: string,
    pending: boolean,
    onClick: () => void
}) {
    const loading: ActivesLoadingState = useAtomValue(activesAtom).loading

    if (p.pending) {
        return (
            <div>
                <img className='img-loading' src='img/loading.gif' />
                {p.title}...
            </div>
        )
    } else {
        if (loading === undefined) {
            return (
                <div>
                    <button
                        className='button-sell'
                        onClick={p.onClick}>
                        {p.title}
                    </button>
                </div>
            )
        } else {
            return (
                <div>
                    <img className='img-loading' src='img/loading.gif' />
                    {p.title}
                </div>
            )
        }
    }
}

export default RefinedButton
