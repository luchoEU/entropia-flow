import { JSX } from "react"
import { WebLoadResponse } from "../../../web/loader"
import ImgButton from "./ImgButton"
import React from "react"

function WebDataControl<T>(p: {
    w: WebLoadResponse<T>,
    name: string,
    dispatchReload: () => any,
    content: (data: T) => JSX.Element
}) {
    const { w, name } = p
    const reload = () => p.dispatchReload && <ImgButton
        title={`Try to load ${name} again`}
        src='img/reload.png'
        className='img-delta-zero'
        dispatch={p.dispatchReload} />
    return <>
        { !w ? reload() : (
            w.loading ?
                <p><img data-show className='img-loading' src='img/loading.gif' /> Loading from {w.loading.source}...</p> :
            (w.errors ?
                <>
                    { w.errors.map((e, index) =>
                        <p key={index}>
                            {e.message} { e.href && <a href={e.href} target='_blank'>link</a> }
                        </p>) }
                    { reload() }
                </> :
                <>
                    <p>{ w.data.link && <a href={w.data.link.href} target='_blank'>{`${name} in ${w.data.link.text}`}</a> }{ reload() }</p>
                    { p.content(w.data.value) }
                </>)
        )}
    </>
}

export default WebDataControl
