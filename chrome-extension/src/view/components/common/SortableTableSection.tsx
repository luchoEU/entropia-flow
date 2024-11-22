import React, { CSSProperties } from 'react'
import { useDispatch, useSelector } from "react-redux"
import { FixedSizeList } from 'react-window';
import ItemText from './ItemText';
import ImgButton from './ImgButton';
import SearchInput from './SearchInput';
import ExpandableSection from './ExpandableSection';
import ExpandablePlusButton from './ExpandablePlusButton';
import TextButton from './TextButton';

const FONT = '12px system-ui, sans-serif'
const FONT_BOLD = `bold ${FONT}`
const IMG_WIDTH = 26
const IMG_SORT_WIDTH = 18
const PLUS_WIDTH = 11 // ExpandablePlusButton
const ITEM_TEXT_PADDING = 5
const INPUT_WIDTH = 200
const SCROLL_BAR_WIDTH = 15
const LIST_TOTAL_HEIGHT = 610 // not multiple of ITEM_SIZE so it is visible there are more
const ITEM_HEIGHT = 20

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
    dispatch?: () => any
}

type SortRowData = { [part: number]: SortRowColumnData }

interface SortRowColumnData {
    justifyContent?: CSSProperties['justifyContent']
    text?: string
}

interface ItemRowColumnData {
    sub: ItemRowSubColumnData[]
    style?: React.CSSProperties
    dispatch?: () => any
}

interface ItemRowSubColumnData {
    flex?: number
    visible?: boolean
    class?: string
    title?: string
    imgButton?: {
        src: string
        text?: string
        show?: boolean
        dispatch: () => any
    }
    plusButton?: {
        expanded: boolean
        setExpanded: (expanded: boolean) => any
    }
    textButton?: {
        text: string
        dispatch: () => any
    }
    itemText?: string
    strong?: string
    input?: {
        value: string
        onChange: (value: string) => any
    }
    img?: {
        src: string
        show?: boolean
    }
    compose?: ItemRowSubColumnData[]
}

interface ColumnWidthData {
    part: number
    width: number
    subWidth: number[]
}

interface TableData<T> {
    columns: number[]
    definition: { [part: number]: { text: string, up: number, down: number} }
    sortRow: SortRowData,
    getRow: (item: T) => ItemRowData
}

const getSubColumnsWidth = (d: ItemRowData, imgWidth: number = IMG_WIDTH): { [part: number]: number[] } =>
    Object.fromEntries(Object.entries(d.columns).map(([k, c]) => [k, getRowColumnWidth(c, imgWidth)]));

const getRowColumnWidth = (c: ItemRowColumnData, imgWidth: number = IMG_WIDTH): number[] => [
    ...c.sub.map(sc =>
        (sc.imgButton ? (sc.imgButton.text ? getTextWidth(sc.imgButton.text, FONT_BOLD): 0) + IMG_WIDTH : 0) +
        (sc.plusButton ? PLUS_WIDTH : 0) +
        (sc.textButton ? getTextWidth(sc.textButton.text, FONT_BOLD) : 0) +
        (sc.itemText ? getTextWidth(sc.itemText, FONT_BOLD) + ITEM_TEXT_PADDING : 0) +
        (sc.input ? INPUT_WIDTH : 0) +
        (sc.strong ? getTextWidth(sc.strong, FONT_BOLD) : 0) +
        (sc.img ? imgWidth : 0) +
        (sc.compose ? getRowColumnWidth({ sub: sc.compose }, imgWidth).reduce((acc, w) => acc + w, 0) : 0)),
    _getPadding(c)
];


const ItemSubRowRender = (p: {sub: ItemRowSubColumnData[], width: number[]}): JSX.Element => <>
    { p.sub.map((sc: ItemRowSubColumnData, j: number) =>
        sc.visible === false ?
            <span key={j} style={{ flex: sc.flex, width: p.width[j] }} /> :
            <span key={j} className={sc.class} title={sc.title} style={{ flex: sc.flex }}>
                { sc.imgButton && <ImgButton text={sc.imgButton.text} title={undefined} src={sc.imgButton.src} dispatch={sc.imgButton.dispatch} show={sc.imgButton.show} /> }
                { sc.plusButton && <ExpandablePlusButton expanded={sc.plusButton.expanded} setExpanded={sc.plusButton.setExpanded} /> }
                { sc.textButton && <TextButton text={sc.textButton.text} title={undefined} dispatch={sc.textButton.dispatch} /> }
                { sc.itemText && <ItemText text={sc.itemText} /> }
                { sc.strong && <strong>{sc.strong}</strong> }
                { sc.input && <Input value={sc.input.value} onChange={sc.input.onChange} /> }
                { sc.img && <img src={sc.img.src} {...sc.img.show && { 'data-show': true }} /> }
                { sc.compose && <ItemSubRowRender sub={sc.compose} width={Array(sc.compose.length).fill(0)} /> }
            </span>
    )}
</>

const Input = (p: { value: string, onChange: (value: string) => any }): JSX.Element => {
    const dispatch = useDispatch()
    return <input
        style={{ width: INPUT_WIDTH }}
        value={p.value}
        onClick={(e) => { e.stopPropagation() }}
        onChange={(e) => {
            e.stopPropagation();
            dispatch(p.onChange(e.target.value))
        }}
    />
}

const ItemRow = <T extends any>(
    getData: (item: T) => ItemRowData,
    itemSelector: (index: number) => (state: any) => T,
    columns: ColumnWidthData[]) =>
    ({ index, style }) => {
    const item: T = useSelector(itemSelector(index))
    if (!item)
        return <p>{`Item ${index} not found`}</p>

    const dispatch = useDispatch()
    const data = getData(item)
    const className = 'item-row' + (data.dispatch ? ' pointer' : '')

    return (
        <div className={className} style={style}
            {...data.dispatch ? { onClick: (e) => { e.stopPropagation(); dispatch(data.dispatch()) } } : {}}>
            <ItemRowRender
                data={data}
                columns={columns} />
        </div>
    )
}

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
                {...d.dispatch ? { onClick: (e) => { e.stopPropagation(); dispatch(d.dispatch()) }, className: 'pointer' } : {}}
            >
                <ItemSubRowRender sub={d.sub} width={c.subWidth} />
            </div>
        })}
    </>
}

interface TableParameters<T> {
    allItems: T[],
    showItems: T[],
    sortType: number,
    sortBy: (part: number) => any,
    itemSelector: (index: number) => (state: any) => T,
    tableData: TableData<T>
}

const SortableFixedSizeTable = <T extends any>(p: {
    data: TableParameters<T>
}) => {
    const d = p.data
    const t = d.tableData
    const sumSubWidth = (d: {[part: number]: number[]}) => Object.fromEntries(Object.entries(d).map(([k, c]) => [k, c.reduce((acc, w) => acc + w, 0)]))
    const itemsSubColumnsWidth = d.allItems.reduce((acc, item) => {
        const cw = getSubColumnsWidth(t.getRow(item))
        return Object.fromEntries(Object.entries(cw).map(([k, w]) => [k,
            acc[k] ? w.map((sw, j) => Math.max(sw, acc[k][j])) : w
        ]))
    }, { } as { [part: number]: number[] })
    const itemsColumnsWidth = sumSubWidth(itemsSubColumnsWidth)

    const sortItemRowData: ItemRowData = {
        columns: Object.fromEntries(t.columns.map(c => [c, {
            dispatch: () => d.sortBy(c),
            style: { justifyContent: t.sortRow[c]?.justifyContent ?? 'center' },
            sub: [
                { strong: t.sortRow[c]?.text ?? t.definition[c].text },
                { visible: d.sortType === t.definition[c].up || d.sortType === t.definition[c].down,
                    img: { src: d.sortType === t.definition[c].up ? 'img/up.png' : 'img/down.png' } }
            ]
        }]))
    }
    const sortSubColumnsWidth = getSubColumnsWidth(sortItemRowData, IMG_SORT_WIDTH)
    const sortColumnsWidth = sumSubWidth(sortSubColumnsWidth)

    const columnsWidth = t.columns.map(k => Math.max(itemsColumnsWidth[k] ?? 0, sortColumnsWidth[k] ?? 0))
    const totalWidth = SCROLL_BAR_WIDTH + Object.values(columnsWidth).reduce((acc, w) => acc + w, 0)

    const getColumnsWidthData = (subWidths: { [part: number]: number[] }): ColumnWidthData[] => t.columns.map((c,i) => ({
        part: c,
        width: columnsWidth[i],
        subWidth: subWidths[c],
    }))

    const itemCount = d.showItems.length
    const height = Math.min(itemCount * ITEM_HEIGHT, LIST_TOTAL_HEIGHT)

    return (
        <div className='sort-table'>
            <div className='sort-row'>
                <ItemRowRender
                    data={sortItemRowData}
                    columns={getColumnsWidthData(sortSubColumnsWidth)} />
            </div>
            <FixedSizeList
                height={height}
                itemCount={itemCount}
                itemSize={ITEM_HEIGHT}
                width={totalWidth}>
                {ItemRow(t.getRow, d.itemSelector, getColumnsWidthData(itemsSubColumnsWidth))}
            </FixedSizeList>
        </div>
    )
}

const SortableTableSection = <T extends any>(p: {
    title: string,
    expanded: boolean,
    filter: string,
    stats: { count: number, ped?: string, itemTypeName?: string },
    searchRowAfterTotalColumnData?: ItemRowColumnData,
    searchRowAfterSearchColumnData?: ItemRowColumnData,
    setExpanded: (expanded: boolean) => any,
    setFilter: (v: string) => any,
    table: TableParameters<T>
}) => {
    const stats = p.stats
    return <ExpandableSection title={p.title} expanded={p.expanded} setExpanded={p.setExpanded}>
        <div className='search-container'>
            <p><span>{ stats.ped ? `Total value ${stats.ped} PED for` : 'Listing'}</span>
                <span> {stats.count} </span>
                <span> {stats.itemTypeName ?? 'item'}{stats.count == 1 ? '' : 's'}</span>
                { p.searchRowAfterTotalColumnData && <ItemSubRowRender sub={p.searchRowAfterTotalColumnData.sub} width={getRowColumnWidth(p.searchRowAfterTotalColumnData)} /> }
            </p>
            <p className='search-input-container'><SearchInput filter={p.filter} setFilter={p.setFilter} />
                { p.searchRowAfterSearchColumnData && <ItemSubRowRender sub={p.searchRowAfterSearchColumnData.sub} width={getRowColumnWidth(p.searchRowAfterSearchColumnData)} /> }
            </p>
        </div>
        <SortableFixedSizeTable data={p.table} />
    </ExpandableSection>
}

export default SortableTableSection
export {
    SortableFixedSizeTable,
    TableData,
    ItemRowColumnData,
    ItemRowSubColumnData,
    ItemRowData,
    SortRowData,
}