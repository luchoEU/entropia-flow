import React from 'react'
import { useSetAtom, useAtomValue } from 'jotai'
import { sortByAtom, setItemExpandedAtom, exportToFileAtom, toggleActionsViewAtom, copyHistoryItemAtom } from '../../application/atoms/history'
import { setAsLastAtom, lastTimestampAtom } from '../../application/atoms/last'
import { isFeatureEnabledAtom } from '../../application/atoms/settings'
import { Feature } from '../../application/state/settings'
import { ViewInventory } from '../../application/state/history'
import InventoryDifference from './InventoryDifference'
import ActionTree from './ActionTree'
import ExpandablePlusButton from '../common/ExpandablePlusButton'
import ItemText from '../common/ItemText'
import ImgButton from '../common/ImgButton'

const InventoryItem = (p: { item: ViewInventory }) => {
    const { item } = p
    const setSortBy = useSetAtom(sortByAtom)
    const setExpanded = useSetAtom(setItemExpandedAtom)
    const exportFile = useSetAtom(exportToFileAtom)
    const toggleActions = useSetAtom(toggleActionsViewAtom)
    const setAsLast = useSetAtom(setAsLastAtom)
    const copyItem = useSetAtom(copyHistoryItemAtom)
    const lastTimestamp = useAtomValue(lastTimestampAtom)
    const useComma = useAtomValue(isFeatureEnabledAtom(Feature.commaDecimalSeparator))
    const isLast = item.rawInventory.meta.date === lastTimestamp

    const config = {
        sortBy: (part: number) => () => setSortBy({ key: item.key, part }),
        allowExclude: false,
        showPeds: false,
        showMarkup: false,
        movedTitle: 'this item was moved by the amount in parenthesis'
    }

    return <>
        <tr className='item-row img-hover-container' onClick={() => setExpanded({ key: item.key, expanded: !item.expanded })}>
            <td>
                <ExpandablePlusButton
                    className={item.class}
                    expanded={item.diff ? item.expanded : undefined}
                    setExpanded={(expanded: boolean) => setExpanded({ key: item.key, expanded })}
                />
                <ItemText className={item.class} text={ item.text } />
                { item.info &&
                    <span
                        className='img-txt-info'
                        title={item.info}>i</span>
                }
                { item.canBeLast && <ImgButton
                    title='Export all items to a file'
                    src='img/export.png'
                    className='img-btn-export'
                    action={() => exportFile(item.key)} />
                }
                { item.diff && item.diff.length > 0 && <ImgButton
                    title='Copy to clipboard'
                    src='img/copy.png'
                    className='img-btn-copy'
                    clickPopup='Copied!'
                    action={() => copyItem({ key: item.key, useComma }) } />
                }
            </td>
            <td>
                { isLast ?
                    <span className='label-up'>Session Start</span> :
                    (item.canBeLast &&
                        <ImgButton
                            title='Set this moment as the start of the session'
                            src='img/up.png'
                            className='img-btn-up'
                            afterText='Session Start'
                            action={() => setAsLast(item.rawInventory.meta.date)}
                        />
                    )
                }
            </td>
        </tr>
        { item.expanded && <tr><td colSpan={2}>
                { item.actions && item.actions.length > 0 &&
                    <button
                        className='button-toggle-view'
                        onClick={(e) => {
                            e.stopPropagation()
                            toggleActions(item.key)
                        }}>
                        {item.showActions ? 'Show Items' : 'Show Actions'}
                    </button>
                }
                { item.showActions && item.actions && item.actions.length > 0 ?
                    <ActionTree actions={item.actions} /> :
                    <InventoryDifference diff={item.diff} peds={[]} config={config} />
                }
            </td></tr>
        }
    </>
}

export default InventoryItem
