import React, { JSX, useEffect, useMemo } from "react"
import SimpleImgButton from "./SimpleImgButton"
import { useAtomValue, useSetAtom } from "jotai"
import { Atom, WritableAtom } from "jotai"
import { WebLoadResponse } from "../../../web/loader"

export function JotaiWebDataControl<T>({
    valueGet,
    loadGet,
    name,
    itemName,
    onReload,
    showWithErrors,
    content
}: {
    valueGet: (itemName: string) => Atom<WebLoadResponse<T> | undefined>,
    loadGet: (itemName: string) => WritableAtom<unknown, [], Promise<void>>,
    name: string,
    itemName: string,
    onReload?: () => void,
    showWithErrors?: boolean,
    content: (data: T | undefined) => JSX.Element,
}) {
    const valueAtom = useMemo(() => valueGet(itemName), [itemName])
    const loadAtom = useMemo(() => loadGet(itemName), [itemName])
    const load = useSetAtom(loadAtom)
    const value = useAtomValue(valueAtom)
    useEffect(() => {
        if (!value?.data) {
            load()
        }
    }, [load])

    const reload = () => onReload && <SimpleImgButton
    title={`Try to load ${name} again`}
    src='img/reload.png'
    className='img-btn-delta-zero'
    onClick={onReload} />

    if (!value || value.loading) {
        return <>
            <p>
                <img data-show className='img-loading' src='img/loading.gif' /> Loading {name} from {value?.loading?.source ?? 'unknown'}...
            </p>
            { content(undefined) }
        </>
    }

    if (value.errors) {
        return <>
            <p style={{ color: '#d32f2f' }}>
                Error loading {name}: {value.errors.map(error => error.message).join(', ')}
            </p>
            { reload() }
            { showWithErrors && content(undefined) }
        </>
    }

    return <>
        <p>{ reload() }</p>
        { content(value.data?.value) }
    </>
}
