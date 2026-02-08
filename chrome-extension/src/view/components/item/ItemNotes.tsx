import { useMemo } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { getItemAtom, setItemNotesAtom } from "../../application/atoms/items";
import { FieldArea } from "../common/Field";

const ItemNotes = ({ name, style }: { name: string, style?: React.CSSProperties }) => {
    const itemAtom = useMemo(() => getItemAtom(name), [name])
    const item = useAtomValue(itemAtom)
    const setNotes = useSetAtom(setItemNotesAtom)

    if (!item) return <></>

    return (
        <div style={style}>
            <FieldArea label='Notes:' value={item?.notes ?? ''} getChangeAction={(value) => setNotes(name, value)} />
        </div>
    )
}

export default ItemNotes;
