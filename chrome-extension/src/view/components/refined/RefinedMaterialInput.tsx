import React from 'react'
import { useSelector } from 'react-redux'
import { materialMarkupChanged } from '../../application/actions/materials'
import { getMaterialsMap } from '../../application/selectors/materials'
import { MaterialsMap } from '../../application/state/materials'
import RefinedInput from './RefinedInput'

function RefinedMaterialInput(p: {
    name: string,
}) {
    const materials: MaterialsMap = useSelector(getMaterialsMap)
    const material = materials[p.name]

    return (
        <RefinedInput
            label={material.name}
            value={material.markup}
            unit={material.unit}
            getChangeAction={materialMarkupChanged(material.name)} />
    )
}

export default RefinedMaterialInput
