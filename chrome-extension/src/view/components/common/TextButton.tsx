import React from "react"
import { useDispatch } from "react-redux"
import { NavigateFunction, useNavigate } from "react-router-dom"
import { multiDispatch } from "./ImgButton"

const TextButton = (p: {
    title: string,
    text: string,
    className?: string,
    dispatch: (navigate: NavigateFunction) => any,
}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    return <button className={`button-text ${p.className ?? ''}`} title={p.title} onClick={(e) => {
        e.stopPropagation();
        multiDispatch(dispatch, navigate, p.dispatch);
    }}>{p.text}</button>
}

export default TextButton
