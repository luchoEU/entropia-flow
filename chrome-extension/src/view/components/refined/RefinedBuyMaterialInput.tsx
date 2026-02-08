import React, { useMemo } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { setItemBuyMarkupAtom, getItemAtom } from '../../application/atoms/items'
import { ItemState } from '../../application/state/items'
import RefinedInput from './RefinedInput'

function RefinedBuyMaterialInput(p: {
    name: string,
}) {
    const itemAtom = useMemo(() => getItemAtom(p.name), [p.name])
    const m: ItemState | undefined = useAtomValue(itemAtom)
    const setMarkup = useSetAtom(setItemBuyMarkupAtom)

    if (!m) return <>Item {p.name} not found</>

    return (
        <>
            <RefinedInput
                label={p.name}
                value={m.markup.value}
                unit={m.markup.unit}
                onChange={(value) => setMarkup(p.name, value)} />
        </>
    )
}

export default RefinedBuyMaterialInput
