import React from "react"
import { useDispatch } from "react-redux"

function Field(p: {
    label: string,
    value: string,
    getChangeAction: (v: string) => any
}) {
    const dispatch = useDispatch()

    return (
        <p>
            <label>{p.label}</label>
            <input
                type='text'
                value={p.value}
                onChange={(e) => dispatch(p.getChangeAction(e.target.value))} />
        </p>
    )
}

function FieldArea(p: {
    label: string,
    value: string,
    getChangeAction: (v: string) => any
}) {
    const dispatch = useDispatch()

    return (
        <p>
            <label>{p.label}</label>
            <textarea
                value={p.value}
                onChange={(e) => dispatch(p.getChangeAction(e.target.value))} />
        </p>
    )
}

export {
    Field,
    FieldArea
}
