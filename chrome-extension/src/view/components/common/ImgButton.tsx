import React, { CSSProperties, MouseEventHandler } from "react"
import { useDispatch } from "react-redux"
import { Dispatch, UnknownAction } from "redux"

const ImgButton = (p: {
    title: string,
    text?: string,
    src: string,
    dispatch: () => any,
    clickPopup?: string
    className?: string
    style?: CSSProperties
    show?: boolean
}) => {
    const dispatch = useDispatch()
    const onClick: MouseEventHandler<HTMLSpanElement> = (e) => {
        e.stopPropagation()

        if (p.clickPopup) {
            const popup = e.currentTarget.querySelector('.popup') as HTMLElement
            popup.style.display = 'block'
            setTimeout(() => { popup.style.display = 'none' }, 1000)
        }

        multiDispatch(dispatch, p.dispatch)
    }

    return <>
        <span
            title={p.title}
            className={'pointer popup-container ' + (p.className ?? '')}
            onClick={onClick}
            {...p.style ? { style: p.style } : {}}
            {...p.show ? { 'data-show': true } : {}}>
            <img src={p.src}
                {...p.className ? { className: p.className } : {}}
                {...p.show ? { 'data-show': true } : {}}
            />
            {p.clickPopup && <span style={{ display: 'none' }} className='popup'>{p.clickPopup}</span>}
            {p.text}
        </span>
    </>;
}

function multiDispatch(dispatch: Dispatch<UnknownAction>, getDispatchAction: () => any) {
    const action = getDispatchAction()
    if (Array.isArray(action)) {
        action.forEach((a) => dispatch(a))
    } else {
        dispatch(action)
    }
}

export default ImgButton
export {
    multiDispatch
}
