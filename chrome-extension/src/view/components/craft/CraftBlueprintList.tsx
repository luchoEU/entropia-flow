import React, { useMemo } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { staredAtom, setBlueprintStaredAtom, craftOptionsAtom, setCraftOptionsAtom } from '../../application/atoms/craft'
import { CRAFT_TABULAR_BLUEPRINTS } from '../../application/state/craft'
import ImgButton from '../common/ImgButton'
import { JotaiSortableTableSection } from '../common/jotai/JotaiSortableTableSection'
import { craftBlueprintsItemsAtom } from '../../application/atoms/craftTables'
import { createCraftBlueprintConfig } from '../../application/configs/craftTableConfigs'
import { useNavigate } from 'react-router-dom'
import { formatToUrl } from '../../application/helpers/navigation'
import { TabId } from '../../application/state/navigation'

const StarButton = ({ bpName }: { bpName: string }) => {
    const staredList = useAtomValue(staredAtom)
    const setBlueprintStared = useSetAtom(setBlueprintStaredAtom)

    const isStared = staredList.list.includes(bpName)

    return <ImgButton
        title={`${isStared ? 'Remove from' : 'Add to'} Favorite Blueprints`}
        src={isStared ? 'img/staron.png' : 'img/staroff.png'}
        action={() => setBlueprintStared(bpName, !isStared)} />
}

function CraftBlueprintList() {
    const opt = useAtomValue(craftOptionsAtom)
    const setCraftOptions = useSetAtom(setCraftOptionsAtom)
    const navigate = useNavigate()
    const setBlueprintStared = useSetAtom(setBlueprintStaredAtom)

    const config = useMemo(() => createCraftBlueprintConfig({
        navigateToBlueprint: (name) => navigate(`${TabId.CRAFT}/${formatToUrl(name)}`),
        toggleStared: (name, stared) => setBlueprintStared(name, stared)
    }), [navigate, setBlueprintStared])

    const beforeTable = useMemo(() => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ flex: 1 }} />
            <button
                className={`button-option-switch ${opt.custom ? 'active' : ''}`}
                title="Show only edited blueprints"
                onClick={() => setCraftOptions({ custom: !opt.custom })}
            >
                E
            </button>
            <button
                className={`button-option-switch ${opt.owned ? 'active' : ''}`}
                title="Show only owned blueprints"
                onClick={() => setCraftOptions({ owned: !opt.owned })}
            >
                O
            </button>
        </div>
    ), [opt.custom, opt.owned, setCraftOptions])

    return (
        <JotaiSortableTableSection
            selector={CRAFT_TABULAR_BLUEPRINTS}
            title="Blueprints"
            subtitle="List of Blueprints"
            itemsAtom={craftBlueprintsItemsAtom}
            config={config}
            beforeTable={beforeTable}
        />
    )
}

export default CraftBlueprintList
export { StarButton }
