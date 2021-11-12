import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { endLoading } from '../../application/actions/actives'
import { getLoading } from '../../application/selectors/actives'
import { ACTIVES_LOADING_STATE, OperationText, StageText, STAGE_ERROR } from '../../application/state/actives'

function AuctionLoading() {
    const dispatch = useDispatch()
    const loading: ACTIVES_LOADING_STATE = useSelector(getLoading)

    if (loading !== undefined) {
        if (loading.errorText !== undefined) {
            return (
                <div>
                    <p className='error'>
                        {OperationText[loading.operation]}:
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
                        {OperationText[loading.operation]}:
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
