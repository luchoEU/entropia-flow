import React, { JSX } from "react"
import SimpleImgButton from "./SimpleImgButton"
import { useAtomValue } from "jotai"
import { Atom } from "jotai"
import { LoadableState } from "../../application/atoms/inventory"

export function JotaiWebDataControl<T>({
    loadableAtom,
    name,
    onReload,
    showWithErrors,
    content
}: {
    loadableAtom: Atom<LoadableState<T>>,
    name: string,
    onReload?: () => void,
    showWithErrors?: boolean,
    content: (data: T | undefined) => JSX.Element,
}) {
    const value = useAtomValue(loadableAtom)

    const reload = () => onReload && <SimpleImgButton
        title={`Try to load ${name} again`}
        src='img/reload.png'
        className='img-btn-delta-zero'
        onClick={onReload} />

    if (value.state === 'loading') {
        return <>
            <p>
                <img data-show className='img-loading' src='img/loading.gif' /> Loading {name}...
            </p>
            { content(undefined) }
        </>
    }

    if (value.state === 'hasError') {
        const errorMsg = value.error instanceof Error ? value.error.message : String(value.error)
        return <>
            <p style={{ color: '#d32f2f' }}>
                Error loading {name}: {errorMsg}
            </p>
            { reload() }
            { showWithErrors && content(undefined) }
        </>
    }

    return <>
        <p>{ reload() }</p>
        { content(value.data) }
    </>
}
