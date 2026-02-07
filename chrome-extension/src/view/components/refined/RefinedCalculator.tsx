import React, { useCallback } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { refinedValueChanged } from '../../application/helpers/refined'
import { itemsMapAtom } from '../../application/atoms/items'
import { sheetsAtom, addSheetsPendingChangeAtom } from '../../application/atoms/sheets'
import { setRefinedValueAtom } from '../../application/atoms/refined'
import { RefinedOneState } from '../../application/state/refined'
import { OPERATION_TYPE_REFINED_AUCTION_MATERIAL } from '../../application/state/sheets'
import { BudgetLineData } from '../../services/api/sheets/sheetsBudget'
import RefinedInput from './RefinedInput'
import RefinedMaterialInput from './RefinedBuyMaterialInput'
import RefinedOutput from './RefinedOutput'
import { refinedMap } from '../../application/helpers/items'

const RefineCaculator = (p: {
    material: RefinedOneState
}) => {
    const { material } = p
    const c = material.calculator
    const m = useAtomValue(itemsMapAtom)
    const sheets = useAtomValue(sheetsAtom)
    const addPendingChange = useSetAtom(addSheetsPendingChangeAtom)
    const setRefinedValue = useSetAtom(setRefinedValueAtom)

    const pending = sheets.pending.some((pend: any) => pend.operationType === OPERATION_TYPE_REFINED_AUCTION_MATERIAL && pend.material === material.name)

    const handleValueChange = useCallback((value: string) => {
        setRefinedValue(material.name, value)
    }, [material.name, setRefinedValue])

    const handleAuction = useCallback(() => {
        const line: BudgetLineData = {
            date: Date.now(),
            reason: 'Auction',
            ped: -Number(c.out.openingFee),
            materials: []
        }
        const auctionTitle = `Auction ${refinedMap[material.name].toUpperCase()}`
        addPendingChange(
            OPERATION_TYPE_REFINED_AUCTION_MATERIAL,
            0,
            material.name,
            [line],
            [auctionTitle, material.name, c.out.amount, c.out.openingValue, c.out.openingFee, c.out.buyoutValue, c.out.buyoutFee]
        )
    }, [material, c, addPendingChange])

    return (
        <section>
            <h2>Calculator</h2>
            <div className='calc-refined'>
                { c.in.sourceMaterials.map(source =>
                    <RefinedMaterialInput key={source} name={source} />
                )}

                <RefinedMaterialInput name={c.in.refinedMaterial} />

                <RefinedInput
                    label='Value'
                    value={c.in.value}
                    unit='PED'
                    onChange={handleValueChange} />
            </div>
            <RefinedOutput
                out={c.out}
                pending={pending}
                onAuction={handleAuction} />
        </section>
    )
}

export default RefineCaculator
