import React, { useMemo } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { getItemAtom, setItemNotesAtom } from "../../application/atoms/items";
import { FieldArea } from "../common/Field";
import ItemSyncStatus from "./ItemSyncStatus";

const ItemNotes = ({ name }: { name: string }) => {
    const itemAtom = useMemo(() => getItemAtom(name), [name])
    const item = useAtomValue(itemAtom)
    const setNotes = useSetAtom(setItemNotesAtom)

    if (!item) return <></>

    return (
        <div>
            <FieldArea label='Notes:' value={item?.notes} getChangeAction={(value) => setNotes(name, value)} />
            <div style={{ marginLeft: 'auto', marginTop: '-35px', marginRight: '0', display: 'flex', justifyContent: 'flex-end' }}>
                <ItemSyncStatus />
            </div>
        </div>
    )
}

export default ItemNotes;
