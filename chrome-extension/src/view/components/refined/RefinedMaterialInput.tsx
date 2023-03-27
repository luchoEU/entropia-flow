import React from 'react'
import { useSelector } from 'react-redux'
import { materialMarkupChanged } from '../../application/actions/materials'
import { getMaterial } from '../../application/selectors/materials'
import { MaterialState } from '../../application/state/materials'
import RefinedInput from './RefinedInput'

function RefinedMaterialInput(p: {
    name: string,
}) {
    const m: MaterialState = useSelector(getMaterial(p.name))

    return (
        <RefinedInput
            label={m.c.name}
            value={m.markup}
            unit={m.c.unit}
            getChangeAction={materialMarkupChanged(m.c.name)} />
    )
}

export default RefinedMaterialInput
