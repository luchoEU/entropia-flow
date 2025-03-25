import React from "react";
import { Field } from "../common/Field";
import { useSelector } from "react-redux";
import { getMaterial } from "../../application/selectors/materials";
import { materialBuyMarkupChanged } from "../../application/actions/materials";

const MaterialMarkup = ({ name }: { name: string }) => {
    const material = useSelector(getMaterial(name))
    if (!material) return <></>
    
    return (
        <Field label='Markup:' value={material.buyMarkup ?? ''}
                getChangeAction={materialBuyMarkupChanged(name)}>
            <span>%</span>
            { material.buyMarkupModified ?
                <span> (Modified on { new Date(material.buyMarkupModified).toLocaleDateString() })</span> : '' }
        </Field>
    )
}

export default MaterialMarkup;
