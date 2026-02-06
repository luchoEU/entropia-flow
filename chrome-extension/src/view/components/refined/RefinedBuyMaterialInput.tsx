import React, { useMemo } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { itemBuyMarkupChangedAtom, getItemAtom } from '../../application/atoms/items'
import { ItemState } from '../../application/state/items'
import RefinedInput from './RefinedInput'

function RefinedBuyMaterialInput(p: {
    name: string,
}) {
    const itemAtom = useMemo(() => getItemAtom(p.name), [p.name])
    const m: ItemState = useAtomValue(itemAtom)
    const setMarkup = useSetAtom(itemBuyMarkupChangedAtom)

    return (
        <>
            <RefinedInput
                label={m.name}
                value={m.markup.value}
                unit={m.markup.unit}
                onChange={(value) => setMarkup(m.name, value)} />
        </>
    )
}

export default RefinedBuyMaterialInput
