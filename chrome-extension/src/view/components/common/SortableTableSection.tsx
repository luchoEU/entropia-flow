import React, { CSSProperties } from 'react'
import { useDispatch, useSelector } from "react-redux"
import { FixedSizeList } from 'react-window';
import ItemText from './ItemText';
import ImgButton from './ImgButton';
import SearchInput from './SearchInput';
import { InventoryListWithFilter } from '../../application/state/inventory';
import ExpandableSection from './ExpandableSection';

const FONT = 'bold 12px system-ui, sans-serif'
const IMG_WIDTH = 26
const TEXT_PADDING = 5
const LIST_TOTAL_HEIGHT = 610 // not multiple of ITEM_SIZE so it is visible there are more
const ITEM_SIZE = 20

function getTextWidth(text: string, font: string): number {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
  
    if (context) {
      context.font = font;
      const metrics = context.measureText(text);
      return Math.ceil(metrics.width);
    }

    return 0;
}

type ItemRowData = { [part: number]: ItemRowColumnData }
type SortRowData = { [part: number]: SortRowColumnData }

interface SortRowColumnData {
    justifyContent?: string
    nameOverride?: string
}

interface ItemRowColumnData {
    sub: ItemRowSubColumnData[]
    justifyContent?: string
    dispatch?: () => void
}

interface ItemRowSubColumnData {
    flex?: number
    visible?: boolean
    button?: {
        title: string
        src: string
        dispatch: () => void
    }
    text?: string
    strong?: string
    img?: string
}

interface ColumnWidthData {
    part: number
    width: number
    subWidth: number[]
}

const getColumnsWidth = (d: ItemRowData): { [part: number]: number[] } => Object.fromEntries(Object.entries(d)
    .map(([k, v]) => [k, v.sub.map(sc =>
        (sc.button ? IMG_WIDTH: 0) +
        (sc.text ? getTextWidth(sc.text, FONT) + TEXT_PADDING : 0) +
        (sc.strong ? getTextWidth(sc.strong, FONT) + TEXT_PADDING : 0) +
        (sc.img ? IMG_WIDTH : 0)
    )])
);

const ItemRow = <T extends any>(
    getData: (item: T) => ItemRowData,
    itemSelector: (index: number) => (state: any) => T,
    columns: ColumnWidthData[]) =>
    ({ index, style }) => {
    const item: T = useSelector(itemSelector(index))

    return (
        <div className='item-row' style={style}>
            <ItemRowRender
                data={getData(item)}
                columns={columns} />
        </div>
    )
}

const ItemRowRender = (p: {
    data: ItemRowData,
    columns: ColumnWidthData[]
}): JSX.Element => {
    const dispatch = useDispatch()
    return <>
        { p.columns.map((c: ColumnWidthData) => {
            const d = p.data[c.part]
            return <div key={c.part} style={{ width: c.width, font: FONT, display: 'inline-flex', justifyContent: d.justifyContent ?? 'start' }}
                {...d.dispatch ? { onClick: (e) => { e.stopPropagation(); dispatch(d.dispatch()) } } : {}}>
            { d.sub.map((sc: ItemRowSubColumnData, j: number) => {
                const style: CSSProperties = { flex: sc.flex, visibility: sc.visible === false ? 'hidden' : undefined }
                return <>
                    { sc.button && <ImgButton style={style} title={sc.button.title} src={sc.button.src} dispatch={sc.button.dispatch} /> }
                    { sc.text && <ItemText style={style} text={sc.text} /> }
                    { sc.strong && <strong style={style}>{sc.strong}</strong> }
                    { sc.img && <img style={style} src={sc.img} /> }
                </>
            })}
            </div>
        })}
    </>
}

const SortableTableSection = <T extends any>(p: {
    title: string,
    setExpanded: (expanded: boolean) => any,
    setFilter: (v: string) => any,
    sortBy: (part: number) => any,
    columns: number[],
    definition: { [part: number]: { text: string, up: number, down: number} },
    inv: InventoryListWithFilter<T>,
    sortRowData: SortRowData,
    getRowData: (item: T) => any,
    itemSelector: (index: number) => (state: any) => T
}) => {
    const sumSubWidth = (d: {[part: number]: number[]}) => Object.fromEntries(Object.entries(d).map(([k, c]) => [k, c.reduce((acc, w) => acc + w, 0)]))
    const subColumnsWidth = p.inv.originalList.items.reduce((acc, item) => { // use originalList so widths don't change when filtering
        const cw = getColumnsWidth(p.getRowData(item))
        return Object.fromEntries(Object.entries(cw).map(([k, w]) => [k,
            acc[k] ? w.map((sw, j) => Math.max(sw, acc[k][j])) : w
        ]))
    }, { } as { [part: number]: number[] })
    let columnsWidth = sumSubWidth(subColumnsWidth)

    const sortType = p.inv.showList.sortType
    const sortItemRowData: ItemRowData = Object.fromEntries(p.columns.map(c => [c, {
        dispatch: () => p.sortBy(c),
        justifyContent: p.sortRowData[c]?.justifyContent ?? 'center',
        sub: [
            { strong: p.sortRowData[c]?.nameOverride ?? p.definition[c].text },
            { visible: sortType === p.definition[c].up || sortType === p.definition[c].down,
                img: sortType === p.definition[c].up ? 'img/up.png' : 'img/down.png' }
        ]
    }]))
    const sortSubColumnsWidth = getColumnsWidth(sortItemRowData)
    const sortColumnsWidth = sumSubWidth(sortSubColumnsWidth)
    columnsWidth = Object.fromEntries(Object.entries(columnsWidth).map(([k, w]) => [k, Math.max(w, sortColumnsWidth[k])]))

    const getColumnsWidthData = (subWidths: { [part: number]: number[] }): ColumnWidthData[] => p.columns.map(c => ({
        part: c,
        width: columnsWidth[c],
        subWidth: subWidths[c],
    }))

    const totalWidth = Object.values(columnsWidth).reduce((acc, w) => acc + w, 0)

    const stats = p.inv.showList.stats
    const itemCount = p.inv.showList.items.length
    const height = Math.min(itemCount * ITEM_SIZE, LIST_TOTAL_HEIGHT)
    return <ExpandableSection title={p.title} expanded={p.inv.originalList.expanded} setExpanded={p.setExpanded}>
        <div className='search-container'>
            <p>Total value {stats.ped} PED for {stats.count} item{stats.count == 1 ? '' : 's'}</p>
            <p className='search-input-container'><SearchInput filter={p.inv.filter} setFilter={p.setFilter} /></p>
        </div>
        <div className='sort-table'>
            <div className='sort-row'>
                <ItemRowRender
                    data={sortItemRowData}
                    columns={getColumnsWidthData(sortSubColumnsWidth)} />
            </div>
            <FixedSizeList
                height={height}
                itemCount={itemCount}
                itemSize={ITEM_SIZE}
                width={totalWidth}>
                {ItemRow(p.getRowData, p.itemSelector, getColumnsWidthData(subColumnsWidth))}
            </FixedSizeList>
        </div>
    </ExpandableSection>
}

export default SortableTableSection
export {
    ItemRowData,
    SortRowData
}