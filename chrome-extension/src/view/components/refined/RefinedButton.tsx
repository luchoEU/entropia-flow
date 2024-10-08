import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getLoading } from '../../application/selectors/actives'
import { ActivesLoadingState } from '../../application/state/actives'

function RefinedButton(p: {
    title: string,
    pending: boolean,
    action: { type: string }
}) {
    const dispatch = useDispatch()
    const loading: ActivesLoadingState = useSelector(getLoading)

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
                        onClick={() => dispatch(p.action)}>
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
