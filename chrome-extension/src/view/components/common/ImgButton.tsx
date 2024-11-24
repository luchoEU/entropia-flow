import React, { CSSProperties } from "react"
import { useDispatch } from "react-redux"

const ImgButton = (p: {
    title: string,
    text?: string,
    src: string,
    dispatch: () => any,
    className?: string
    style?: CSSProperties
    show?: boolean
}) => {
    const dispatch = useDispatch()
    const onClick = (e) => {
        e.stopPropagation()
        const action = p.dispatch()
        if (Array.isArray(action)) {
            action.forEach((a) => dispatch(a))
        } else {
            dispatch(action)
        }
    }

    return p.text ?
        <span
            title={p.title}
            className={'pointer ' + (p.className ?? '')}
            onClick={onClick}
            {...p.style ? { style: p.style } : {}}
            {...p.show ? { 'data-show': true } : {}}>
            <img src={p.src} />
            {p.text}
        </span> :
        <img
            title={p.title}
            src={p.src}
            className={'pointer ' + (p.className ?? '')}
            onClick={onClick}
            {...p.className ? { className: p.className } : {}}
            {...p.style ? { style: p.style } : {}}
            {...p.show ? { 'data-show': true } : {}} />
}

export default ImgButton
