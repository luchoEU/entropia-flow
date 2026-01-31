import React from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { staredAtom, setBlueprintStaredAtom, craftOptionsAtom, setCraftOptionsAtom } from '../../application/atoms/craft'
import { CRAFT_TABULAR_BLUEPRINTS } from '../../application/state/craft'
import ImgButton from '../common/ImgButton'
import SortableTabularSection from '../common/SortableTabularSection'
import { getSwitchButton } from '../common/SortableTabularSection.control'

const StarButton = ({ bpName }: { bpName: string }) => {
    const staredList = useAtomValue(staredAtom)
    const setBlueprintStared = useSetAtom(setBlueprintStaredAtom)

    const isStared = staredList.list.includes(bpName)

    return <ImgButton
        title={`${isStared ? 'Remove from' : 'Add to'} Favorite Blueprints`}
        src={isStared ? 'img/staron.png' : 'img/staroff.png'}
        dispatch={() => setBlueprintStared(bpName, !isStared)} />
}

function CraftBlueprintList() {
    const opt = useAtomValue(craftOptionsAtom)
    const setCraftOptions = useSetAtom(setCraftOptionsAtom)

    return <SortableTabularSection
        selector={CRAFT_TABULAR_BLUEPRINTS}
        beforeTable={ () => [
            { flex: 1 },
            getSwitchButton('E', 'Show only edited blueprints', opt.custom, () => setCraftOptions({ custom: !opt.custom })),
            getSwitchButton('O', 'Show only owned blueprints', opt.owned, () => setCraftOptions({ owned: !opt.owned })),
        ]}
    />
}

export default CraftBlueprintList
export { StarButton }
