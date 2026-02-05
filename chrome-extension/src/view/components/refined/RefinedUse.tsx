import React, { useMemo } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { itemUseAmountChangedAtom, getItemAtom } from '../../application/atoms/items'
import { RefinedOneState } from '../../application/state/refined'
import RefinedInput from './RefinedInput'
import RefinedButton from './RefinedButton'
import { ItemState } from '../../application/state/items'
import { refinedUseMaterial } from '../../application/actions/sheets'

const RefinedUse = (p: {
    material: RefinedOneState
}) => {
    const { material } = p
    const itemAtom = useMemo(() => getItemAtom(material.name), [material.name])
    const m: ItemState = useAtomValue(itemAtom)
    const setAmount = useSetAtom(itemUseAmountChangedAtom)

    return (
        <section>
            <h2>Use Material</h2>
            <div className='use-refined'>
                <RefinedInput
                    label={m.name}
                    value={m.refined.useAmount}
                    unit=''
                    getChangeAction={(value) => setAmount(m.name, value)} />
                <RefinedButton title='Use' pending={false} action={refinedUseMaterial(material.name, m.refined.useAmount)} />
            </div>
        </section>
    )
}

export default RefinedUse
