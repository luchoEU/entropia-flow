import React, { useMemo, useCallback } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { itemRefineAmountChangedAtom, getItemAtom } from '../../application/atoms/items'
import { addSheetsPendingChangeAtom, sheetsAtom } from '../../application/atoms/sheets'
import { RefinedOneState } from '../../application/state/refined'
import { OPERATION_TYPE_REFINED_REFINE_MATERIAL } from '../../application/state/sheets'
import { BudgetLineData } from '../../services/api/sheets/sheetsBudget'
import RefinedInput from './RefinedInput'
import RefinedButton from './RefinedButton'
import { ItemState } from '../../application/state/items'

const RefinedUse = (p: {
    material: RefinedOneState
}) => {
    const { material } = p
    const itemAtom = useMemo(() => getItemAtom(material.name), [material.name])
    const m: ItemState = useAtomValue(itemAtom)
    const setAmount = useSetAtom(itemRefineAmountChangedAtom)
    const addPendingChange = useSetAtom(addSheetsPendingChangeAtom)
    const sheets = useAtomValue(sheetsAtom)

    const pending = sheets.pending.some((pend: any) => pend.operationType === OPERATION_TYPE_REFINED_REFINE_MATERIAL && pend.material === material.name)
    const materials = material.refine ? material.refine.map(s =>
        ({
            name: s.name,
            quantity: Number(m.refined.refineAmount) * s.mult
        })) : []

    const handleRefine = useCallback(() => {
        const line: BudgetLineData = {
            date: Date.now(),
            reason: 'Refine',
            ped: 0,
            materials
        }
        const doneParams = [material.name, m.refined.refineAmount, ...materials.map(mat => [mat.name, mat.quantity]).flat()]
        addPendingChange(
            OPERATION_TYPE_REFINED_REFINE_MATERIAL,
            0,
            material.name,
            [line],
            doneParams
        )
    }, [material, m, materials, addPendingChange])

    return (
        <section>
            <h2>Refine Material</h2>
            <div className='use-refined'>
                <RefinedInput
                    label={m.name}
                    value={m.refined.refineAmount}
                    unit=''
                    onChange={(value) => setAmount(m.name, value)} />
                <RefinedButton title='Refine' pending={pending} onClick={handleRefine} />
            </div>
        </section>
    )
}

export default RefinedUse
