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
            <span>%</span>
            { item.markup?.modified ?
                <span> (Modified on { new Date(item.markup.modified).toLocaleDateString() })</span> : '' }
        </Field>
    )
}

export default ItemMarkup;
