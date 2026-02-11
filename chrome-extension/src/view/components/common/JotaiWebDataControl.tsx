import React, { JSX, useEffect, useMemo } from "react"
import SimpleImgButton from "./SimpleImgButton"
import { useAtomValue, useSetAtom } from "jotai"
import { Atom, WritableAtom } from "jotai"
import { WebLoadResponse } from "../../../web/loader"
import { CollapsibleTradeItemDetailsSection } from "./CollapsibleTradeItemDetailsSection"

export function JotaiWebDataControl<T>({
    valueGet,
    loadGet,
    name,
    itemName,
    showWithErrors,
    content
}: {
    valueGet: (itemName: string) => Atom<WebLoadResponse<T> | undefined>,
    loadGet: (itemName: string) => WritableAtom<unknown, [], Promise<void>>,
    name: string,
    itemName: string,
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
    }, [load, value?.data])

    const reload = () => <SimpleImgButton
        title={`Try to load ${name} again`}
        src='img/reload.png'
        className='img-btn-delta-zero'
        onClick={load} />

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
        <p>{ reload() } Reload {name}</p>
        { content(value.data?.value) }
    </>
}

type SectionKey = 'basicInfo' | 'ttInventory' | 'itemUsage' | 'inventoryMaterials'

interface CollapsibleTradeItemDetailsWebDataControlProps<T> {
    title: string
    sectionKey: SectionKey
    valueGet: (itemName: string) => Atom<WebLoadResponse<T> | undefined>
    loadGet: (itemName: string) => WritableAtom<unknown, [], Promise<void>>
    itemName: string
    name: string
    showWithErrors?: boolean
    content: (data: T | undefined) => JSX.Element
}

export const CollapsibleTradeItemDetailsWebDataControl = <T,>({
    title,
    sectionKey,
    valueGet,
    loadGet,
    itemName,
    name,
    showWithErrors,
    content
}: CollapsibleTradeItemDetailsWebDataControlProps<T>) => {
    const valueAtom = useMemo(() => valueGet(itemName), [itemName, valueGet])
    const loadAtom = useMemo(() => loadGet(itemName), [itemName, loadGet])
    const value = useAtomValue(valueAtom)
    const load = useSetAtom(loadAtom)
    const hasError = value?.errors && value.errors.length > 0

    useEffect(() => {
        if (!value?.data) {
            load()
        }
    }, [load, value?.data])

    return (
        <CollapsibleTradeItemDetailsSection
            title={title}
            sectionKey={sectionKey}
            loadingIndicator={
                value?.loading ? (
                    <div onClick={(e) => e.stopPropagation()}>
                        <img data-show className='img-loading' src='img/loading.gif' style={{ height: '16px', width: '16px' }} />
                    </div>
                ) : null
            }
            reloadButton={
                <div onClick={(e) => e.stopPropagation()}>
                    <SimpleImgButton
                        title={`Try to load ${name} again`}
                        src='img/reload.png'
                        className='img-btn-delta-zero'
                        style={hasError ? { opacity: '0.7' } : {}}
                        onClick={load}
                    />
                </div>
            }
        >
            {
                !value || value.loading ? content(undefined) :
                value.errors ? <>
                    <p style={{ color: '#d32f2f' }}>
                        Error loading {name}: {value.errors.map(error => error.message).join(', ')}
                    </p>
                    { showWithErrors && content(undefined) }
                </>
                : content(value.data?.value)
            }
        </CollapsibleTradeItemDetailsSection>
    )
}
