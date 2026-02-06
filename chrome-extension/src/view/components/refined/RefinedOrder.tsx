import React, { useMemo, useCallback } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { itemOrderMarkupChangedAtom, itemOrderValueChangedAtom, getItemAtom } from '../../application/atoms/items'
import { addSheetsPendingChangeAtom, sheetsAtom } from '../../application/atoms/sheets'
import { RefinedOneState } from '../../application/state/refined'
import { OPERATION_TYPE_REFINED_ORDER_MATERIAL } from '../../application/state/sheets'
import { BudgetLineData } from '../../services/api/sheets/sheetsBudget'
import RefinedInput from './RefinedInput'
import RefinedButton from './RefinedButton'
import { ItemState } from '../../application/state/items'

const RefinedOrder = (p: {
    material: RefinedOneState
}) => {
    const { material } = p
    const itemAtom = useMemo(() => getItemAtom(material.name), [material.name])
    const m: ItemState = useAtomValue(itemAtom)
    const setMarkup = useSetAtom(itemOrderMarkupChangedAtom)
    const setValue = useSetAtom(itemOrderValueChangedAtom)
    const addPendingChange = useSetAtom(addSheetsPendingChangeAtom)
    const sheets = useAtomValue(sheetsAtom)

    const pending = sheets.pending.some((pend: any) => pend.operationType === OPERATION_TYPE_REFINED_ORDER_MATERIAL && pend.material === material.name)

    const handleOrder = useCallback(() => {
        const line: BudgetLineData = {
            date: Date.now(),
            reason: 'Order',
            ped: 0,
            materials: [
                {
                    name: material.name,
                    quantity: Number(m.refined.orderValue)
                }
            ]
        }
        addPendingChange(
            OPERATION_TYPE_REFINED_ORDER_MATERIAL,
            0,
            material.name,
            [line],
            [material.name, m.refined.orderValue, m.refined.orderMarkup]
        )
    }, [material, m, addPendingChange])

    return (
        <section>
            <h2>Order Material</h2>
            <div className='order-refined'>
                <div /><div>Markup</div><div /><div>PED</div><div />
                <RefinedInput
                    label={m.name}
                    value={m.refined.orderMarkup}
                    unit={m.markup.unit}
                    onChange={(value) => setMarkup(m.name, value)} />
                <input
                    type='text'
                    value={m.refined.orderValue}
                    onChange={(e) => setValue(material.name, e.target.value)} />

                <RefinedButton title='Order' pending={pending} onClick={handleOrder} />
            </div>
        </section>
    )
}

export default RefinedOrder
