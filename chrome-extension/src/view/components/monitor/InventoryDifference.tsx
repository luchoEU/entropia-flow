import React, { useState } from 'react'
import { CONTAINER, NAME, QUANTITY, VALUE } from '../../application/helpers/inventory.sort'
import { VIEW_ITEM_MODE_EDIT_MARKUP, ViewItemData } from '../../application/state/history'
import { hasValue } from '../../application/helpers/diff'
import { useDispatch, useSelector } from 'react-redux'
import { ViewPedData } from '../../application/state/last'
import { addPeds, removePeds } from '../../application/actions/last'
import ImgButton from '../common/ImgButton'
import ItemText from '../common/ItemText'
import { getItem } from '../../application/selectors/items'
import { itemBuyMarkupChanged, setItemMarkupUnit } from '../../application/actions/items'
import TextButton from '../common/TextButton'
import { MarkupUnit, nextUnit, UNIT_PED_K, UNIT_PERCENTAGE, UNIT_PLUS, unitDescription, unitText } from '../../application/state/items'
import { getValueWithMarkup } from '../../application/helpers/items'
import { useNavigate } from 'react-router-dom'
import { SHOW_ACTION_LINK } from '../../../config'

interface Config {
    sortBy: (part: number) => any
    allowExclude: boolean
    include?: (key: number) => any
    exclude?: (key: number) => any
    permanentExcludeOn?: (key: number) => any
    permanentExcludeOff?: (key: number) => any
    setMode?: (key: number, type: number, data: any) => any
    clearMode?: (key: number) => any
    showPeds: boolean
    showMarkup: boolean
    movedTitle: string
}

const ItemRow = (p: {
    item: ViewItemData,
    c: Config
}) => {
    const { item, c } = p
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const material = useSelector(getItem(item.n))
    const sortBy = (part: number) => (e: any) => {
        e.stopPropagation()
        dispatch(c.sortBy(part))
    }

    let valueMU = material?.markup?.value === undefined ? undefined : getValueWithMarkup(item.q, item.v, material);
    const editMarkupMode = item.m?.type === VIEW_ITEM_MODE_EDIT_MARKUP;
    return (
        <tr className='item-row'>
            <td onClick={sortBy(NAME)}>
                <ItemText text={item.n} />
                { item.w &&
                    <ImgButton title='There is already a similar item excluded from the sum' show src='img/warning.png' dispatch={() => c.exclude(item.key)} />
                }
            </td>
            <td>
                {
                    c.allowExclude && hasValue(item) &&
                        (item.e ?
                            (item.x ?
                                <ImgButton title='Remove permanently exclusion from the sum' src='img/forbidden.png' show dispatch={() => c.permanentExcludeOff(item.key)} /> :
                                <>
                                    <ImgButton title='This item is currently excluded from the sum, click to include it again' src='img/cross.png' show dispatch={() => c.include(item.key)} />
                                    <ImgButton title='Permanently exclude this item from the sum' src='img/forbidden.png' dispatch={() => c.permanentExcludeOn(item.key)} />
                                </>
                            ) :
                            <ImgButton title='Exclude this item from the sum' src='img/cross.png' dispatch={() => c.exclude(item.key)} />
                        )
                }
            </td>
            <td onClick={sortBy(QUANTITY)}>
                <ItemText text={item.q} />
            </td>
            <td onClick={sortBy(VALUE)}
                title={item.v.includes('(') ? c.movedTitle : ''}>
                <ItemText text={item.v === '' ? '' : item.v + ' PED'} />
            </td>
            { c.showMarkup && <>
                <td style={{paddingRight: 0}} className='item-cell-value'>
                    { editMarkupMode ?
                        <>
                            <input id='newPedInput' type='text' value={material.markup.value} onChange={(e) => dispatch(itemBuyMarkupChanged(item.n)(e.target.value))} />
                            <TextButton title={`Unit: ${unitDescription(material.markup.unit)}, click to change`} text={unitText(material.markup.unit)} dispatch={() => setItemMarkupUnit(item.n, nextUnit(material.markup.unit)) } />
                        </> : <>
                            <ItemText text={material?.markup?.value ? `${material.markup.value} ${unitText(material.markup.unit)}` : ''} />
                            <ImgButton title='Edit markup' src='img/edit.png' dispatch={() => {
                                const init = []
                                if (!material?.markup?.value) {
                                    // ensure that the material is created
                                    const defaultUnit = (): MarkupUnit => {
                                        if (item.n.endsWith('(L)')) return UNIT_PERCENTAGE
                                        const v = Number(item.v) ?? 0
                                        const q = Number(item.q) ?? 0
                                        if (q > 1 && v / q < 0.01) return UNIT_PED_K
                                        if (q === 1) return UNIT_PLUS
                                        return UNIT_PERCENTAGE
                                    }
                                    const defaultMarkup = (unit: MarkupUnit): string => {
                                        switch (unit) {
                                            case UNIT_PERCENTAGE: return '100';
                                            case UNIT_PLUS: return '0';
                                            case UNIT_PED_K: return '1';
                                 3       }
                                    }
                                    const unit = material?.markup?.unit || defaultUnit();
                                    if (material?.markup?.unit !== unit) {
                                        init.push(setItemMarkupUnit(item.n, unit))
                                    }
                                    init.push(itemBuyMarkupChanged(item.n)(defaultMarkup(unit)))
                                }
                                return [
                                    ...init,
                                    c.setMode(item.key, VIEW_ITEM_MODE_EDIT_MARKUP, material?.markup?.value) // save current value in case of cancel
                                ]
                            }} />
                        </> }
                </td><td style={{paddingLeft: 0}} className={ editMarkupMode ? undefined : 'item-cell-value'}>
                    { editMarkupMode ?
                        <>
                            <ImgButton title='Cancel markup value' src='img/cross.png' show dispatch={() => [ itemBuyMarkupChanged(item.n)(item.m.data), c.clearMode(item.key) ]} />
                            <ImgButton title='Confirm markup value' src='img/tick.png' show dispatch={() => c.clearMode(item.key)} />
                        </> : <>
                            { valueMU !== undefined && <ItemText text={valueMU.toFixed(2) + ' PED'} /> }
                        </> }
                </td></>
            }
            <td onClick={sortBy(CONTAINER)}>
                <ItemText text={item.c} />
            </td>
            <td>
                { SHOW_ACTION_LINK && item.a &&
                    <button
                        className='button-me-log'
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(item.a.navigateTo);
                        }}>
                        { '>' }
                    </button>
                }
            </td>
        </tr>
    )
}

const PedRow = (p: {
    item: ViewPedData,
    c: Config
}) => {
    const { item, c } = p
    return (
        <tr>
            <td>
                <ItemText text={'PED'} />
            </td>
            <td>
                <ImgButton title='Remove PEDs' src='img/cross.png' dispatch={() => removePeds(item.key)} />
            </td>
            <td></td>{ /* quantity */ }
            <td>
                <ItemText text={item.value + ' PED'} />
            </td>
        </tr >
    )
}

const PedNewRow = () => {
    const [peds, setPeds] = useState('')
    const isValid = !isNaN(Number(peds)) && Number(peds) !== 0
    return (
        <tr>
            <td>PED</td>
            <td></td>{ /* actions */ }
            <td></td>{ /* quantity */ }
            <td>
                <input id='newPedInput' type='text' value={peds} onChange={(e) => setPeds(e.target.value)} />
            </td>
            <td>
                { peds && (isValid ?
                    <ImgButton
                        title='Add PEDs'
                        src='img/tick.png' show dispatch={() => {
                        setPeds('')
                        return addPeds(peds)
                    }} /> : <ImgButton
                        title='Cancel'
                        src='img/cross.png' show dispatch={() => {
                        setPeds('')
                        return undefined
                    }} />)
                }
            </td>
        </tr >
    )
}

const InventoryDifference = (p: {
    diff: Array<ViewItemData>,
    peds: Array<ViewPedData>,
    config: Config
}) => {
    return (
        <table className='table-diff'>
            <tbody>
                { p.diff &&
                    p.diff.map((item: ViewItemData) =>
                        <ItemRow
                            key={item.key}
                            item={item}
                            c={p.config} />
                    )
                }
                {
                    p.peds.map((item: ViewPedData) =>
                        <PedRow
                            key={item.key}
                            item={item}
                            c={p.config} />
                    )
                }
                { p.config.showPeds && <PedNewRow key='0' /> }
            </tbody>
        </table>
    )
}

export default InventoryDifference