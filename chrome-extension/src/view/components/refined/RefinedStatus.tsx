import React from "react"
import { useDispatch, useSelector } from "react-redux";
import { ActivesLoadingState } from "../../application/state/actives";
import { getLoading } from "../../application/selectors/actives";
import { endLoading } from "../../application/actions/actives";
import { StageText } from "../../services/api/sheets/sheetsStages";

function RefinedStatus() {
    const dispatch = useDispatch()
    const loading: ActivesLoadingState = useSelector(getLoading)

    if (loading !== undefined) {
        if (loading.errorText !== undefined) {
            return (
                <section>
                    <p className='error'>
                        {loading.loadingText}:
                        <img
                            className='img-loading'
                            src='img/cross.png'
                            onClick={() => dispatch(endLoading)}>
                        </img>
                        {loading.errorText}
                    </p>
                </section>
            )
        } else {
            return (
                <section>
                    <p>
                        {loading.loadingText}:
                        <img className='img-loading' src='img/loading.gif'></img>
                        {StageText[loading.stage]}...
                    </p>
                </section>
            )
        }
    } else {
        return <></>
    }
}

export default RefinedStatus