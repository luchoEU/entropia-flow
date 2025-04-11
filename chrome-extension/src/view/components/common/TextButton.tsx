import React from "react"
import { useDispatch } from "react-redux"

const TextButton = (p: {
    title: string,
    text: string,
    className?: string,
    dispatch: () => any,
}) => {
    const dispatch = useDispatch()

    return <button className={`button-text ${p.className ?? ''}`} title={p.title} onClick={(e) => {
        e.stopPropagation()
        dispatch(p.dispatch())
    }}>{p.text}</button>
}

export default TextButton
