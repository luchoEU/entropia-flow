import React from "react"
import { useAtomValue, useSetAtom } from "jotai";
import { ActivesLoadingState } from "../../application/state/actives";
import { activesAtom, endActivesLoadingAtom } from "../../application/atoms/actives";
import { StageText } from "../../services/api/sheets/sheetsStages";

function RefinedStatus() {
    const loading: ActivesLoadingState = useAtomValue(activesAtom).loading
    const endLoading = useSetAtom(endActivesLoadingAtom)

    if (loading !== undefined) {
        if (loading.errorText !== undefined) {
            return (
                <p className='error'>
                    {loading.loadingText}:
                    <img
                        className='img-loading'
                        src='img/cross.png'
                        onClick={() => endLoading()}>
                    </img>
                    {loading.errorText}
                </p>
            )
        } else {
            return (
                <p>
                    {loading.loadingText}:
                    <img className='img-loading' src='img/loading.gif'></img>
                    {StageText[loading.stage]}...
                </p>
            )
        }
    } else {
        return <></>
    }
}

export default RefinedStatus