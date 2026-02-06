import React from "react"
import { useSetAtom } from "jotai"

const Field = ({ label, value, title, getChangeAction, children }: {
    label: string,
    value: string,
    title?: string,
    getChangeAction: (v: string) => any,
    children?: any
}) => {
    return (
        <p>
            <label title={title}>{label}</label>
            <input
                type='text'
                value={value}
                onChange={(e) => getChangeAction(e.target.value)} />
            { children }
        </p>
    )
}

const FieldArea = ({ label, value, getChangeAction }: {
    label: string,
    value: string,
    getChangeAction: (v: string) => any
}) => {
    return (
        <p>
            <label>{label}</label>
            <textarea
                value={value}
                onChange={(e) => getChangeAction(e.target.value)} />
        </p>
    )
}

// Jotai-based field components
const JotaiField = ({ label, value, title, setAtom, children }: {
    label: string,
    value: string | undefined,
    title?: string,
    setAtom: any,
    children?: any
}) => {
    const setAtomValue = useSetAtom(setAtom)

    return (
        <p>
            <label title={title}>{label}</label>
            <input
                type='text'
                value={value || ''}
                onChange={(e) => setAtomValue(e.target.value || undefined)} />
            { children }
        </p>
    )
}

const JotaiFieldArea = ({ label, value, setAtom }: {
    label: string,
    value: string | undefined,
    setAtom: any
}) => {
    const setAtomValue = useSetAtom(setAtom)

    return (
        <p>
            <label>{label}</label>
            <textarea
                value={value || ''}
                onChange={(e) => setAtomValue(e.target.value || undefined)} />
        </p>
    )
}

export { Field, FieldArea, JotaiField, JotaiFieldArea }
