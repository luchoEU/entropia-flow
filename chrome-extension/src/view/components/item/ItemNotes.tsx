import React from "react";
import { itemNotesValueChanged } from "../../application/actions/items";
import { FieldArea } from "../common/Field";
import { useSelector } from "react-redux";
import { getItem } from "../../application/selectors/items";

const ItemNotes = ({ name }: { name: string }) => {
    const item = useSelector(getItem(name))
    if (!item) return <></>
    
    return (
        <FieldArea label='Notes:' value={item?.notes} getChangeAction={itemNotesValueChanged(name)} />
    )
}

export default ItemNotes;
