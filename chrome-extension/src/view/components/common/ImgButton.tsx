import React from "react"
import { useDispatch } from "react-redux"

const ImgButton = (p: {
    title: string,
    src: string,
    dispatch: () => any,
    className?: string
    show?: boolean
}) => {
    const dispatch = useDispatch()

    return <img
        title={p.title}
        src={p.src}
        onClick={(e) => {
            e.stopPropagation()
            dispatch(p.dispatch())
        }}
        {...p.className ? { className: p.className } : {}}
        {...p.show ? { 'data-show': true } : {}}
    />
}

export default ImgButton
