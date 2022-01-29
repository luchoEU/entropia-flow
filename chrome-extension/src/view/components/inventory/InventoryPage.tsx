import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { moveToHidden, setHiddenInventoryExpanded, setVisibleInventoryExpanded, sortHiddenBy, sortVisibleBy } from '../../application/actions/inventory'
import { getInventory } from '../../application/selectors/inventory'
import { InventoryState } from '../../application/state/inventory'
import InventoryList from './InventoryList'

function InventoryPage() {
    const dispatch = useDispatch()
    const s: InventoryState = useSelector(getInventory)
    const configVisible = {
        setExpanded: setVisibleInventoryExpanded,
        sortBy: (part: number) => () => dispatch(sortVisibleBy(part)),
        move: (name: string) => dispatch(moveToHidden(name)),
        image: 'img/cross.png'
    }
    const configHidden = {
        setExpanded: setHiddenInventoryExpanded,
        sortBy: (part: number) => () => dispatch(sortHiddenBy(part)),
        move: (name: string) => dispatch(moveToHidden(name)),
        image: 'img/tick.png',
    }

    return (
        <>
            <div>
                <InventoryList
                    title='List'
                    list={s.visible}
                    config={configVisible}
                />
            </div>
            <div>
            <InventoryList
                    title='Hidden'
                    list={s.hidden}
                    config={configHidden}
                />
            </div>
        </>
    )
}

export default InventoryPage
