import React from 'react'
import { useDispatch } from 'react-redux'

function RefinedInput(p: {
    label: string,
    value: string,
    unit: string,
    getChangeAction: (v: string) => any
}) {
    const dispatch = useDispatch()

    const x = p.getChangeAction('101.')
    return (
        <>
            <label>{p.label}</label>
            <input
                type='text'
                value={p.value}
                onChange={(e) => dispatch(p.getChangeAction(e.target.value))} />
            <div>{p.unit}</div>
        </>
    )
}

export default RefinedInput
