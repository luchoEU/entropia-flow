import React, { CSSProperties } from 'react'
import { useDispatch, useSelector } from "react-redux"
import { FixedSizeList } from 'react-window';
import ItemText from './ItemText';
import ImgButton from './ImgButton';
import SearchInput from './SearchInput';
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

interface ItemRowData {
    columns: { [part: number]: ItemRowColumnData }
    dispatch?: () => void
}

type SortRowData = { [part: number]: SortRowColumnData }

interface SortRowColumnData {
    justifyContent?: CSSProperties['justifyContent']
    text?: string
}

interface ItemRowColumnData {
    sub: ItemRowSubColumnData[]
    style?: React.CSSProperties
    dispatch?: () => void
}

interface ItemRowSubColumnData {
    flex?: number
    visible?: boolean
    class?: string
    button?: {
        title: string
        src: string
        text?: string
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

const getSubColumnsWidth = (d: ItemRowData): { [part: number]: number[] } => Object.fromEntries(Object.entries(d.columns)
    .map(([k, c]) => [k, [
        _getPadding(c),
        ...c.sub.map(sc =>
            (sc.button ? IMG_WIDTH: 0) +
            (sc.text ? getTextWidth(sc.text, FONT) + TEXT_PADDING : 0) +
            (sc.strong ? getTextWidth(sc.strong, FONT) + TEXT_PADDING : 0) +
            (sc.img ? IMG_WIDTH : 0))
    ]])
);

const ItemRow = <T extends any>(
    getData: (item: T) => ItemRowData,
    itemSelector: (index: number) => (state: any) => T,
    columns: ColumnWidthData[]) =>
    ({ index, style }) => {
    const item: T = useSelector(itemSelector(index))
    const dispatch = useDispatch()
    const data = getData(item)

    return (
        <div className='item-row' style={style}
            {...data.dispatch && { onClick: (e) => { e.stopPropagation(); dispatch(data.dispatch) } }}>
            <ItemRowRender
                data={data}
                columns={columns} />
        </div>
    )
}

const ItemSubRowRender = (p: {part?: number, sub: ItemRowSubColumnData[]}): JSX.Element => <>
    { p.sub.map((sc: ItemRowSubColumnData, j: number) =>
        <span key={j} className={sc.class} style={{ flex: sc.flex, visibility: sc.visible === false ? 'hidden' : undefined }}>
            { sc.button && <ImgButton title={sc.button.title} text={sc.button.text} src={sc.button.src} dispatch={sc.button.dispatch} /> }
            { sc.text && <ItemText text={sc.text} /> }
            { sc.strong && <strong>{sc.strong}</strong> }
            { sc.img && <img src={sc.img} /> }
        </span>
    )}
</>

function _getPadding(c: ItemRowColumnData): number {
    const paddingLeft = c.style?.paddingLeft ? parseInt(c.style.paddingLeft.toString()) : 0;
    const paddingRight = c.style?.paddingRight ? parseInt(c.style.paddingRight.toString()) : 0;
    return paddingLeft + paddingRight;
}

const ItemRowRender = (p: {
    data: ItemRowData,
    columns: ColumnWidthData[]
}): JSX.Element => {
    const dispatch = useDispatch()
    return <>
        { p.columns.map((c: ColumnWidthData) => {
            const d = p.data.columns[c.part]
            return d && <div key={c.part} style={{ ...d.style, width: c.width - _getPadding(d), font: FONT, display: 'inline-flex' }}
                {...d.dispatch ? { onClick: (e) => { e.stopPropagation(); dispatch(d.dispatch()) } } : {}}
            >
                <ItemSubRowRender sub={d.sub} />
            </div>
        })}
    </>
}

const SortableTableSection = <T extends any>(p: {
    title: string,
    expanded: boolean,
    filter: string,
    allItems: T[],
    showItems: T[],
    sortType: number,
    stats: { count: number, ped: string },
    setExpanded: (expanded: boolean) => any,
    setFilter: (v: string) => any,
    sortBy: (part: number) => any,
    columns: number[],
    definition: { [part: number]: { text: string, up: number, down: number} },
    sortRowData: SortRowData,
    getRowData: (item: T) => ItemRowData,
    itemSelector: (index: number) => (state: any) => T,
    searchRowColumnData?: ItemRowColumnData
}) => {
    const sumSubWidth = (d: {[part: number]: number[]}) => Object.fromEntries(Object.entries(d).map(([k, c]) => [k, c.reduce((acc, w) => acc + w, 0)]))
    const itemsSubColumnsWidth = p.allItems.reduce((acc, item) => {
        const cw = getSubColumnsWidth(p.getRowData(item))
        return Object.fromEntries(Object.entries(cw).map(([k, w]) => [k,
            acc[k] ? w.map((sw, j) => Math.max(sw, acc[k][j])) : w
        ]))
    }, { } as { [part: number]: number[] })
    const itemsColumnsWidth = sumSubWidth(itemsSubColumnsWidth)

    const sortItemRowData: ItemRowData = {
        columns: Object.fromEntries(p.columns.map(c => [c, {
            dispatch: () => p.sortBy(c),
            style: { justifyContent: p.sortRowData[c]?.justifyContent ?? 'center' },
            sub: [
                { strong: p.sortRowData[c]?.text ?? p.definition[c].text },
                { visible: p.sortType === p.definition[c].up || p.sortType === p.definition[c].down,
                    img: p.sortType === p.definition[c].up ? 'img/up.png' : 'img/down.png' }
            ]
        }]))
    }
    const sortSubColumnsWidth = getSubColumnsWidth(sortItemRowData)
    const sortColumnsWidth = sumSubWidth(sortSubColumnsWidth)

    const columnsWidth = p.columns.map(k => Math.max(itemsColumnsWidth[k] ?? 0, sortColumnsWidth[k] ?? 0))
    const totalWidth = Object.values(columnsWidth).reduce((acc, w) => acc + w, 0)

    const getColumnsWidthData = (subWidths: { [part: number]: number[] }): ColumnWidthData[] => p.columns.map((c,i) => ({
        part: c,
        width: columnsWidth[i],
        subWidth: subWidths[c],
    }))

    const stats = p.stats
    const itemCount = p.showItems.length
    const height = Math.min(itemCount * ITEM_SIZE, LIST_TOTAL_HEIGHT)
    return <ExpandableSection title={p.title} expanded={p.expanded} setExpanded={p.setExpanded}>
        <div className='search-container'>
            <p>Total value {stats.ped} PED for {stats.count} item{stats.count == 1 ? '' : 's'}
                { p.searchRowColumnData && <ItemSubRowRender sub={p.searchRowColumnData.sub} /> }
            </p>
            <p className='search-input-container'><SearchInput filter={p.filter} setFilter={p.setFilter} /></p>
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
                {ItemRow(p.getRowData, p.itemSelector, getColumnsWidthData(itemsSubColumnsWidth))}
            </FixedSizeList>
        </div>
    </ExpandableSection>
}

export default SortableTableSection
export {
    ItemRowData,
    ItemRowColumnData,
    SortRowData
}