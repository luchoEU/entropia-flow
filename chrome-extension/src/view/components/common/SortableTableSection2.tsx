import React, { CSSProperties, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from "react-redux"
import { FixedSizeList } from 'react-window';
import ItemText from './ItemText';
import ImgButton from './ImgButton';
import SearchInput from './SearchInput';
import ExpandableSection from './ExpandableSection';
import ExpandablePlusButton from './ExpandablePlusButton';
import TextButton from './TextButton';
import isEqual from 'lodash.isequal';
import { SortSecuence } from '../../application/state/sort';

const FONT = '12px system-ui, sans-serif'
const FONT_BOLD = `bold ${FONT}`
const IMG_WIDTH = 26
const IMG_SORT_WIDTH = 18
const PLUS_WIDTH = 11 // ExpandablePlusButton
const ITEM_TEXT_PADDING = 5
const INPUT_WIDTH = 200
const SCROLL_BAR_WIDTH = 17
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
    columns: ItemRowColumnData[]
    dispatch?: () => any
}

type SortRowData = Array<SortRowColumnData>

interface SortRowColumnData {
    justifyContent?: CSSProperties['justifyContent']
    text: string
    show?: boolean
    sortable?: boolean
    sub?: ItemRowSubColumnData[]
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
    width: number
    subWidth: number[]
}

interface TableData<TItem> {
    columns: number // column count
    sortRow: SortRowData,
    getRow: (item: TItem) => ItemRowData
}

const getSubColumnsWidth = (d: ItemRowData, imgWidth: number = IMG_WIDTH): number[][] =>
    d.columns.map(c => getRowColumnWidth(c, imgWidth));

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
            <span key={j} style={{ flex: sc.flex, width: p.width ? p.width[j] : 0 }} /> :
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
        style={{ width: INPUT_WIDTH, font: FONT }}
        value={p.value}
        onClick={(e) => { e.stopPropagation() }}
        onChange={(e) => {
            e.stopPropagation();
            dispatch(p.onChange(e.target.value))
        }}
    />
}

const ItemRow = <T extends any>(
    { index, style, getData, itemSelector, columns } : {
    index: number;
    style: React.CSSProperties;
    getData: (item: T) => ItemRowData;
    itemSelector: (index: number) => (state: any) => T;
    columns: ColumnWidthData[];
}) => {
    const item: T = useSelector(itemSelector(index));
    if (!item) return <p>{`Item ${index} not found`}</p>;

    const dispatch = useDispatch();
    const data = getData(item);
    const className = 'item-row' + (data.dispatch ? ' pointer' : '');

    return (
    <div
        className={className}
        style={style}
        {...(data.dispatch
        ? { onClick: (e) => { e.stopPropagation(); dispatch(data.dispatch()); } }
        : {})}
    >
        <ItemRowRender data={data} columns={columns} />
    </div>
    );
};

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
        { p.columns.map((c: ColumnWidthData, i: number) => {
            const d = p.data.columns[i]
            return d && <div key={i} style={{ ...d.style, width: c.width - _getPadding(d), font: FONT, display: 'inline-flex' }}
                {...d.dispatch ? { onClick: (e) => { e.stopPropagation(); dispatch(d.dispatch()) }, className: 'pointer' } : {}}
            >
                <ItemSubRowRender sub={d.sub} width={c.subWidth} />
            </div>
        })}
    </>
}

// A custom hook to memoize deep comparisons
export function useDeepCompareMemoize(value: any) {
    const ref = useRef<any>();

    if (!isEqual(value, ref.current)) {
        ref.current = value;
    }

    return ref.current;
}

const _sum = (d: number[]): number => d.reduce((acc, n) => acc + n, 0)

const calculate = <TItem extends any>(d: TableParametersInput<TItem>): TableParameters<TItem> => {
    const t = d.tableData

    const filterVisible = <T extends any>(d: T[]): T[] => d.filter((_, c) => t.sortRow[c]?.show !== false)

    const itemsSubColumnsWidth = filterVisible(d.allItems.reduce((acc, item) => {
        const cw = getSubColumnsWidth(t.getRow(item))
        return acc ? acc.map((w, i) => w.map((sw, j) => Math.max(sw, cw[i][j]))) : cw
    }, undefined as number[][]))

    const sortItemRowData: ItemRowData = {
        columns: filterVisible(Array.from({ length: t.columns }, (_, i) => i))
            .map(c => ({
                dispatch: () => t.sortRow[c].sortable !== false && d.sortBy(c),
                style: { justifyContent: t.sortRow[c]?.justifyContent ?? 'center' },
                sub: [
                    { strong: t.sortRow[c]?.text },
                    { visible: t.sortRow[c]?.sortable !== false && d.sortType[0].column === c,
                        img: { src: d.sortType[0].ascending ? 'img/up.png' : 'img/down.png' },
                    ...t.sortRow[c]?.sub }
                ]
            }))
    }
    const sortSubColumnsWidth = getSubColumnsWidth(sortItemRowData, IMG_SORT_WIDTH)

    const columnsWidth: number[] = itemsSubColumnsWidth.map((w, i) => Math.max(_sum(w), _sum(sortSubColumnsWidth[i])))
    
    return {
        itemCount: d.showItems.length,
        sortItemRowData,
        itemsSubColumnsWidth,
        sortSubColumnsWidth,
        columnsWidth,
        getRowData: i => { const x = t.getRow(i); return { ...x, columns: filterVisible(x.columns) } },
        itemSelector: d.itemSelector
    }
}

interface TableParametersInput<TItem> {
    allItems: TItem[],
    showItems: TItem[],
    sortType: SortSecuence,
    sortBy: (part: number) => any,
    itemSelector: (index: number) => (state: any) => TItem,
    tableData: TableData<TItem>
}

interface TableParameters<TItem> {
    itemCount: number,
    sortItemRowData: ItemRowData,
    itemsSubColumnsWidth: number[][],
    sortSubColumnsWidth: number[][],
    columnsWidth: number[],
    getRowData: (item: TItem) => ItemRowData,
    itemSelector: (index: number) => (state: any) => TItem,
}

const SortableFixedSizeTable = <TItem extends any>(p: {
    data: TableParameters<TItem>
}) => {
    const d = p.data
    const height = Math.min(d.itemCount * ITEM_HEIGHT, LIST_TOTAL_HEIGHT)

    const totalWidth = SCROLL_BAR_WIDTH + _sum(d.columnsWidth)

    const getColumnsWidthData = (subWidths: number[][]): ColumnWidthData[] => subWidths.map((sw, i) => ({
        width: d.columnsWidth[i],
        subWidth: sw,
    }))

    const stableItemsSubColumnsWidth = useDeepCompareMemoize(d.itemsSubColumnsWidth);
    const renderRow = useCallback(
        ({ index, style }: { index: number; style: React.CSSProperties }) => {
            return (
            <ItemRow
                index={index}
                style={style}
                getData={d.getRowData}
                itemSelector={d.itemSelector}
                columns={getColumnsWidthData(stableItemsSubColumnsWidth)}
            />
        )}, [stableItemsSubColumnsWidth]);

    return (
        <div className='sort-table'>
            <div className='sort-row'>
                <ItemRowRender
                    data={d.sortItemRowData}
                    columns={getColumnsWidthData(d.sortSubColumnsWidth)} />
            </div>
            <FixedSizeList
                height={height}
                itemCount={d.itemCount}
                itemSize={ITEM_HEIGHT}
                width={totalWidth}>
                {renderRow}
            </FixedSizeList>
        </div>
    )
}

const SortableTableSection = <TItem extends any>(p: {
    title: string,
    expanded: boolean,
    filter: string,
    stats: { count: number, ped?: string, itemTypeName?: string },
    searchRowAfterTotalColumnData?: ItemRowColumnData,
    searchRowAfterSearchColumnData?: ItemRowColumnData,
    setExpanded: (expanded: boolean) => any,
    setFilter: (v: string) => any,
    table: TableParametersInput<TItem>
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
        <SortableFixedSizeTable data={calculate(p.table)} />
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
    calculate,
}