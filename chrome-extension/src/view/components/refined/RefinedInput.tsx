import React from 'react'

function RefinedInput(p: {
    label: string,
    value: string,
    unit: string,
    onChange?: (v: string) => void,
    getChangeAction?: (v: string) => any
}) {
    const handleChange = (value: string) => {
        // Support both new Jotai pattern (onChange) and old Redux pattern (getChangeAction)
        if (p.onChange) {
            p.onChange(value)
        } else if (p.getChangeAction) {
            const result = p.getChangeAction(value)
            // If it returns a promise (async atom), handle it
            if (result instanceof Promise) {
                result.catch(err => console.error('Change error:', err))
            }
        }
    }

    return (
        <>
            <label>{p.label}</label>
            <input
                type='text'
                value={p.value}
                onChange={(e) => handleChange(e.target.value)} />
            <div>{p.unit}</div>
        </>
    )
}

export default RefinedInput
