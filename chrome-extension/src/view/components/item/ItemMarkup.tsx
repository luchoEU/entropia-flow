import React, { useMemo } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { Field } from "../common/Field";
import { getItemAtom, itemBuyMarkupChangedAtom } from "../../application/atoms/items";

const ItemMarkup = ({ name }: { name: string }) => {
    const itemAtom = useMemo(() => getItemAtom(name), [name])
    const item = useAtomValue(itemAtom)
    const setMarkup = useSetAtom(itemBuyMarkupChangedAtom)

    if (!item) return <></>

    return (
        <Field label='Markup:' value={item.markup?.value ?? ''}
                getChangeAction={(value) => setMarkup(name, value)}>
            { item.markup?.modified ?
                <span style={{ fontSize: '0.85em', color: '#999', marginLeft: '15px' }}>% (Modified on { new Date(item.markup.modified).toLocaleDateString() })</span> : '' }
        </Field>
    )
}

export default ItemMarkup;
