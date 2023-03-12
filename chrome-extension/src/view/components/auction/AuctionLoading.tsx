import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { endLoading } from '../../application/actions/actives'
import { getLoading } from '../../application/selectors/actives'
import { ActivesLoadingState } from '../../application/state/actives'
import { StageText } from '../../services/api/sheets/sheetsStages'

function AuctionLoading() {
    const dispatch = useDispatch()
    const loading: ActivesLoadingState = useSelector(getLoading)

    if (loading !== undefined) {
        if (loading.errorText !== undefined) {
            return (
                <div>
                    <p className='error'>
                        {loading.loadingText}:
                        <img
                            className='img-loading'
                            src='img/cross.png'
                            onClick={() => dispatch(endLoading)}>
                        </img>
                        {loading.errorText}
                    </p>
                </div>
            )
        } else {
            return (
                <div>
                    <p>
                        {loading.loadingText}:
                        <img className='img-loading' src='img/loading.gif'></img>
                        {StageText[loading.stage]}...
                    </p>
                </div>
            )
        }
    } else {
        return <></>
    }
}

export default AuctionLoading
