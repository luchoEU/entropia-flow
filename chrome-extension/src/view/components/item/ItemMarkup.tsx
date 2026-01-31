import React from "react";
import { Field } from "../common/Field";
import { useSelector } from "react-redux";
import { getItem } from "../../application/selectors/items";
import { itemBuyMarkupChanged } from "../../application/actions/items";

const ItemMarkup = ({ name }: { name: string }) => {
    const item = useSelector(getItem(name))
    if (!item) return <></>
    
    return (
        <Field label='Markup:' value={item.markup?.value ?? ''}
                getChangeAction={itemBuyMarkupChanged(name)}>
            { item.markup?.modified ?
                <span style={{ fontSize: '0.85em', color: '#999', marginLeft: '15px' }}>% (Modified on { new Date(item.markup.modified).toLocaleDateString() })</span> : '' }
        </Field>
    )
}

export default ItemMarkup;
