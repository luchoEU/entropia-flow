import React, { CSSProperties, MouseEventHandler } from "react"
import { useDispatch } from "react-redux"
import { NavigateFunction, useNavigate } from "react-router-dom"
import { Dispatch, UnknownAction } from "redux"

const ImgButton = ({ title, beforeText, afterText, src, dispatch: pDispatch, clickPopup, className, style, show }: {
    title: string,
    beforeText?: string,
    afterText?: string,
    src: string,
    dispatch: (navigate: NavigateFunction) => any,
    clickPopup?: string
    className?: string
    style?: CSSProperties
    show?: boolean
}) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const onClick: MouseEventHandler<HTMLSpanElement> = (e) => {
        e.stopPropagation()

        if (clickPopup) {
            const popup = e.currentTarget.querySelector('.popup') as HTMLElement
            popup.style.display = 'block'
            setTimeout(() => { popup.style.display = 'none' }, 1000)
        }

        multiDispatch(dispatch, navigate, pDispatch)
    }

    return <>
        <span
            title={title}
            className={'pointer popup-container ' + (className ?? '')}
            onClick={onClick}
            {...style ? { style } : {}}
            {...show ? { 'data-show': true } : {}}>
            {beforeText}
            <img src={src}
                {...show ? { 'data-show': true } : {}}
            />
            {clickPopup && <span style={{ display: 'none' }} className='popup'>{clickPopup}</span>}
            {afterText}
        </span>
    </>;
}

function multiDispatch(dispatch: Dispatch<UnknownAction>,
    navigate: NavigateFunction,
    getDispatchAction: (navigate: NavigateFunction) => any
) {
    const action = getDispatchAction(navigate)
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
