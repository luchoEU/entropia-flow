import React from 'react'
import { useSelector } from 'react-redux'
import { setBlueprintStared, setCraftOptions } from '../../application/actions/craft'
import { getCraftOptions, isBlueprintStared } from '../../application/selectors/craft'
import { CRAFT_TABULAR_BLUEPRINTS } from '../../application/state/craft'
import ImgButton from '../common/ImgButton'
import SortableTabularSection from '../common/SortableTabularSection'
import { getSwitchButton } from '../common/SortableTabularSection.control'

const StarButton = ({ bpName }: { bpName: string }) => {
    const stared = useSelector(isBlueprintStared(bpName))
    return <ImgButton
        title={`${stared ? 'Remove from' : 'Add to'} Favorite Blueprints`}
        src={stared ? 'img/staron.png' : 'img/staroff.png'}
        dispatch={() => setBlueprintStared(bpName, !stared)} />
}

function CraftBlueprintList() {
    const opt = useSelector(getCraftOptions)

    return <SortableTabularSection
        selector={CRAFT_TABULAR_BLUEPRINTS}
        beforeTable={ () => [
            { flex: 1 },
            getSwitchButton('C', 'Show only custom edited blueprints', opt.custom, () => setCraftOptions({ custom: !opt.custom }), [
                { img: 'img/export.png', title: 'Export custom edited blueprints' },
            ]),
            getSwitchButton('O', 'Show only owned blueprints', opt.owned, () => setCraftOptions({ owned: !opt.owned })),
        ]}
    />
}

export default CraftBlueprintList
export { StarButton }
