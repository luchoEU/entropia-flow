import React, { useMemo, useCallback } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { setItemUseAmountAtom, getItemAtom } from '../../application/atoms/items'
import { RefinedOneState } from '../../application/state/refined'
import RefinedInput from './RefinedInput'
import RefinedButton from './RefinedButton'
import { ItemState } from '../../application/state/items'

const RefinedUse = (p: {
    material: RefinedOneState
}) => {
    const { material } = p
    const itemAtom = useMemo(() => getItemAtom(material.name), [material.name])
    const m: ItemState = useAtomValue(itemAtom)
    const setAmount = useSetAtom(setItemUseAmountAtom)

    const handleUse = useCallback(() => {
        // TODO: Implement refined material use sheet operation in Jotai
        console.log(`Use ${material.name}: ${m.refined.useAmount}`)
    }, [material.name, m.refined.useAmount])

    return (
        <section>
            <h2>Use Material</h2>
            <div className='use-refined'>
                <RefinedInput
                    label={m.name}
                    value={m.refined.useAmount}
                    unit=''
                    getChangeAction={(value) => setAmount(m.name, value)} />
                <RefinedButton title='Use' pending={false} onClick={handleUse} />
            </div>
        </section>
    )
}

export default RefinedUse
