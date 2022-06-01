import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getLoading } from '../../application/selectors/actives'
import { ACTIVES_LOADING_STATE } from '../../application/state/actives'

function AuctionButton(p: {
    title: string,
    pending: boolean,
    action: { type: string }
}) {
    const dispatch = useDispatch()
    const loading: ACTIVES_LOADING_STATE = useSelector(getLoading)

    if (loading === undefined) {
        if (p.pending) {
            return (
                <div>
                    <button
                        className='button-sell-pending'
                        onClick={() => dispatch(p.action)}>
                        {p.title}...
                    </button>
                </div>
            )
        } else {
            return (
                <div>
                    <button
                        className='button-sell'
                        onClick={() => dispatch(p.action)}>
                        {p.title}
                    </button>
                </div>
            )
        }
    } else {
        if (p.pending) {
            return (
                <div>
                    <img className='img-loading' src='img/loading.gif' />
                    {p.title}...
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

export default AuctionButton
