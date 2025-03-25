import React from "react";
import { materialNotesValueChanged } from "../../application/actions/materials";
import { FieldArea } from "../common/Field";
import { useSelector } from "react-redux";
import { getMaterial } from "../../application/selectors/materials";

const MaterialNotes = ({ name }: { name: string }) => {
    const material = useSelector(getMaterial(name))
    if (!material) return <></>
    
    return (
        <FieldArea label='Notes:' value={material?.notes} getChangeAction={materialNotesValueChanged(name)} />
    )
}

export default MaterialNotes;
