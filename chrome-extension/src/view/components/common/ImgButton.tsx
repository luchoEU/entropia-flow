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

    return p.text ?
        <span
            title={p.title}
            className={'pointer ' + (p.className ?? '')}
            onClick={(e) => {
                e.stopPropagation()
                dispatch(p.dispatch())
            }}
            {...p.style ? { style: p.style } : {}}
            {...p.show ? { 'data-show': true } : {}}>
            <img src={p.src} />
            {p.text}
        </span> :
        <img
            title={p.title}
            src={p.src}
            className={'pointer ' + (p.className ?? '')}
            onClick={(e) => {
                e.stopPropagation()
                dispatch(p.dispatch())
            }}
            {...p.className ? { className: p.className } : {}}
            {...p.style ? { style: p.style } : {}}
            {...p.show ? { 'data-show': true } : {}} />
}

export default ImgButton
