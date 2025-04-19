import React, { CSSProperties, JSX, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from "react-redux"
import { FixedSizeList } from 'react-window';
import ItemText from './ItemText';
import ImgButton from './ImgButton';
import SearchInput from './SearchInput';
import ExpandableSection from './ExpandableSection2';
import ExpandablePlusButton from './ExpandablePlusButton';
import TextButton from './TextButton';
import isEqual from 'lodash.isequal';
import { NavigateFunction, useNavigate } from 'react-router-dom';

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
    columns: { [part: number]: ItemRowColumnData }
    dispatch?: (navigate: NavigateFunction) => any
}

type SortRowData = { [part: number]: SortRowColumnData }

interface SortRowColumnData {
    justifyContent?: CSSProperties['justifyContent']
    text?: string
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
    part: number
    width: number
    subWidth: number[]
}

interface TableData<TItem, TExtra = void> {
    columns: number[]
    definition: { [part: number]: { text: string, up: number, down: number} }
    sortRow: SortRowData,
    getRow: (item: TItem, extra: TExtra) => ItemRowData
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
            <span key={j} style={{ flex: sc.flex, width: p.width ? p.width[j] : 0 }} /> :
            <span key={j} className={sc.class} title={sc.title} style={{ flex: sc.flex }}>
                { sc.imgButton && <ImgButton afterText={sc.imgButton.text} title={undefined} src={sc.imgButton.src} dispatch={sc.imgButton.dispatch} show={sc.imgButton.show} /> }
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
    const navigate = useNavigate();
    const data = getData(item);
    const className = 'item-row' + (data.dispatch ? ' pointer' : '');

    return (
    <div
        className={className}
        style={style}
        {...(data.dispatch
        ? { onClick: (e) => { e.stopPropagation(); dispatch(data.dispatch(navigate)); } }
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

interface TableParameters<TItem> {
    widthItems?: TItem[], // used to calculate the width, by default showItems is used
    showItems: TItem[],
    sortType: number,
    sortBy: (part: number) => any,
    itemSelector: (index: number) => (state: any) => TItem,
    tableData: TableData<TItem>
}

// A custom hook to memoize deep comparisons
export function useDeepCompareMemoize(value: any) {
    const ref = useRef<any>([]);

    if (!isEqual(value, ref.current)) {
        ref.current = value;
    }

    return ref.current;
}

// Deprecated control
// TODO: migrate to SortableTabularSection
const SortableFixedSizeTable = <TItem extends any>(p: {
    data: TableParameters<TItem>
}) => {
    const d = p.data
    const t = d.tableData
    const sumSubWidth = (d: {[part: number]: number[]}) => Object.fromEntries(Object.entries(d).map(([k, c]) => [k, c.reduce((acc, w) => acc + w, 0)]))
    const itemsSubColumnsWidth = (d.widthItems ?? d.showItems).reduce((acc, item) => {
        const cw = getSubColumnsWidth(t.getRow(item))
        return Object.fromEntries(Object.entries(cw).map(([k, w]) => [k,
            acc[k] ? w.map((sw, j) => Math.max(sw, acc[k][j])) : w
        ]))
    }, { } as { [part: number]: number[] })
    const itemsColumnsWidth = sumSubWidth(itemsSubColumnsWidth)

    const sortItemRowData: ItemRowData = {
        columns: Object.fromEntries(t.columns
            .filter(c => t.sortRow[c]?.show !== false)
            .map(c => [c, {
                dispatch: () => t.sortRow[c].sortable !== false && d.sortBy(c),
                style: { justifyContent: t.sortRow[c]?.justifyContent ?? 'center' },
                sub: [
                    { strong: t.sortRow[c]?.text ?? t.definition[c].text },
                    { visible: t.sortRow[c]?.sortable !== false && (d.sortType === t.definition[c].up || d.sortType === t.definition[c].down),
                        img: { src: (d.sortType === t.definition[c].up) ? 'img/up.png' : 'img/down.png' },
                    ...t.sortRow[c]?.sub }
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

    const stableItemsSubColumnsWidth = useDeepCompareMemoize(itemsSubColumnsWidth);
    const renderRow = useCallback(
        ({ index, style }: { index: number; style: React.CSSProperties }) => {
            return (
            <ItemRow
                index={index}
                style={style}
                getData={t.getRow}
                itemSelector={d.itemSelector}
                columns={getColumnsWidthData(stableItemsSubColumnsWidth)}
            />
        )}, [stableItemsSubColumnsWidth]);

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
                {renderRow}
            </FixedSizeList>
        </div>
    )
}

// Deprecated control
// TODO: migrate to SortableTabularSection
const SortableTableSection = <TItem extends any>(p: {
    selector: string,
    title: string,
    subtitle: string,
    expanded: boolean,
    filter: string,
    stats: { count: number, ped?: string, itemTypeName?: string },
    searchRowAfterTotalColumnData?: ItemRowColumnData,
    searchRowAfterSearchColumnData?: ItemRowColumnData,
    afterTitle?: JSX.Element,
    setFilter: (v: string) => any,
    table: TableParameters<TItem>
}) => {
    const stats = p.stats
    return <ExpandableSection selector={`TableSection.${p.selector}`} title={p.title} subtitle={p.subtitle} afterTitle={p.afterTitle}>
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