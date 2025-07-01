import { JSX, useEffect } from "react"
import { WebLoadResponse } from "../../../web/loader"
import ImgButton, { multiDispatch } from "./ImgButton"
import React from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"

function WebDataControl<T>({
    w,
    name,
    dispatchReload,
    content
}: {
    w: WebLoadResponse<T>,
    name: string,
    dispatchReload: () => any,
    content: (data: T) => JSX.Element
}) {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const reload = () => dispatchReload && <ImgButton
        title={`Try to load ${name} again`}
        src='img/reload.png'
        className='img-btn-delta-zero'
        dispatch={dispatchReload} />

    useEffect(() => {
        if (!w && dispatchReload) {
            multiDispatch(dispatch, navigate, dispatchReload);
        }
    }, [w])

    return <>
        { !w ? <p>{name}{ reload() }</p> : (
            w.loading ?
                <p><img data-show className='img-loading' src='img/loading.gif' /> Loading from {w.loading.source}...</p> :
            (w.errors ?
                <>
                    { w.errors.map((e, index) =>
                        <p key={`${e.message}-${index}`}>
                            {e.message} { e.href && <a href={e.href} target='_blank'>link</a> }
                        </p>) }
                    { reload() }
                </> :
                <>
                    <p>{ w.data.link && <a href={w.data.link.href} target='_blank'>{`${name} in ${w.data.link.text}`}</a> }{ reload() }</p>
                    { content(w.data.value) }
                </>)
        )}
    </>
}

export default WebDataControl
