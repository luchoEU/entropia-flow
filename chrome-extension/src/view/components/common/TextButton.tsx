import React from "react"
import { NavigateFunction, useNavigate } from "react-router-dom"
import { multiDispatch } from "./ImgButton"

const TextButton = (p: {
    title: string,
    text: string,
    className?: string,
    dispatch: (navigate: NavigateFunction) => any,
}) => {
    const navigate = useNavigate();
    return <button className={`button-text img-btn ${p.className ?? ''}`} title={p.title} onClick={(e) => {
        e.stopPropagation();
        multiDispatch(navigate, p.dispatch);
    }}>{p.text}</button>
}

export default TextButton
