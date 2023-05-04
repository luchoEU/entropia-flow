import React from 'react'
import { useSelector } from 'react-redux'
import { materialBuyMarkupChanged } from '../../application/actions/materials'
import { getMaterial } from '../../application/selectors/materials'
import { MaterialState } from '../../application/state/materials'
import RefinedInput from './RefinedInput'

function RefinedBuyMaterialInput(p: {
    name: string,
}) {
    const m: MaterialState = useSelector(getMaterial(p.name))

    return (
        <>
            <RefinedInput
                label={m.c.name}
                value={m.buyMarkup}
                unit={m.c.unit}
                getChangeAction={materialBuyMarkupChanged(m.c.name)} />
        </>
    )
}

export default RefinedBuyMaterialInput
