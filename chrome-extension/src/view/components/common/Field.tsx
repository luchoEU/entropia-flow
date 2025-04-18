import React from "react"
import { useDispatch } from "react-redux"

const Field = ({ label, value, title, getChangeAction, children }: {
    label: string,
    value: string,
    title?: string,
    getChangeAction: (v: string) => any,
    children?: any
}) => {
    const dispatch = useDispatch()

    return (
        <p>
            <label title={title}>{label}</label>
            <input
                type='text'
                value={value}
                onChange={(e) => dispatch(getChangeAction(e.target.value))} />
            { children }
        </p>
    )
}

const FieldArea = ({ label, value, getChangeAction }: {
    label: string,
    value: string,
    getChangeAction: (v: string) => any
}) => {
    const dispatch = useDispatch()

    return (
        <p>
            <label>{label}</label>
            <textarea
                value={value}
                onChange={(e) => dispatch(getChangeAction(e.target.value))} />
        </p>
    )
}

export { Field, FieldArea }
