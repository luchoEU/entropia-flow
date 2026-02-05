import React, { useMemo } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { getItemAtom, itemNotesValueChangedAtom } from "../../application/atoms/items";
import { FieldArea } from "../common/Field";

const ItemNotes = ({ name }: { name: string }) => {
    const itemAtom = useMemo(() => getItemAtom(name), [name])
    const item = useAtomValue(itemAtom)
    const setNotes = useSetAtom(itemNotesValueChangedAtom)

    if (!item) return <></>

    return (
        <FieldArea label='Notes:' value={item?.notes} getChangeAction={(value) => setNotes(name, value)} />
    )
}

export default ItemNotes;
