import { JSX, useEffect } from "react"
import { WebLoadResponse } from "../../../web/loader"
import ImgButton from "./ImgButton"
import { useNavigate } from "react-router-dom"

function WebDataControl<T>({
    w,
    name,
    dispatchReload,
    showWithErrors,
    content
}: {
    w: WebLoadResponse<T> | undefined,
    name: string,
    dispatchReload: () => any,
    showWithErrors?: boolean,
    content: (data: T | undefined) => JSX.Element,
}) {
    const navigate = useNavigate()

    const reload = () => dispatchReload && <ImgButton
        title={`Try to load ${name} again`}
        src='img/reload.png'
        className='img-btn-delta-zero'
        action={() => dispatchReload()} />

    useEffect(() => {
        if (!w && dispatchReload) {
            dispatchReload();
        }
    }, [w, dispatchReload])

    return <>
        { !w ? <p style={{ display: 'flex', gap: '5px' }}>{name}{ reload() }</p> : (
            w.loading ?
                <div>
                    <img data-show className='img-loading' src='img/loading.gif' /> Loading from {w.loading.source}...
                    { content(w.data?.value) }
                </div> :
            (w.errors ?
                <>
                    { w.errors.map((e, index) =>
                        <p key={`${e.message}-${index}`}>
                            {e.message} { e.href && <a href={e.href} target='_blank'>link</a> }
                        </p>) }
                    { reload() }
                    { showWithErrors && content(undefined) }
                </> :
                <>
                    <p>{ w.data?.link && <a href={w.data.link.href} target='_blank'>{`${name} in ${w.data.link.text}`}</a> }{ reload() }</p>
                    { content(w.data?.value) }
                </>
        ))}
    </>
}

export default WebDataControl
