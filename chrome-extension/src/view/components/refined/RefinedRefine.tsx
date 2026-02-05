import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useAtomValue, useSetAtom } from 'jotai'
import { itemRefineAmountChangedAtom, getItemAtom } from '../../application/atoms/items'
import { RefinedOneState } from '../../application/state/refined'
import RefinedInput from './RefinedInput'
import RefinedButton from './RefinedButton'
import { ItemState } from '../../application/state/items'
import { refinedRefineMaterial } from '../../application/actions/sheets'
import { sheetPendingRefinedRefine } from '../../application/selectors/sheets'

const RefinedUse = (p: {
    material: RefinedOneState
}) => {
    const { material } = p
    const itemAtom = useMemo(() => getItemAtom(material.name), [material.name])
    const m: ItemState = useAtomValue(itemAtom)
    const setAmount = useSetAtom(itemRefineAmountChangedAtom)
    const pending = useSelector(sheetPendingRefinedRefine(material.name))
    const materials = material.refine ? material.refine.map(s =>
        ({
            name: s.name,
            quantity: Number(m.refined.refineAmount) * s.mult
        })) : []

    return (
        <section>
            <h2>Refine Material</h2>
            <div className='use-refined'>
                <RefinedInput
                    label={m.name}
                    value={m.refined.refineAmount}
                    unit=''
                    getChangeAction={(value) => setAmount(m.name, value)} />
                <RefinedButton title='Refine' pending={pending} action={refinedRefineMaterial(material.name, materials)} />
            </div>
        </section>
    )
}

export default RefinedUse
