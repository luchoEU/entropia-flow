import React, { JSX, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from "react-redux"
import { FixedSizeList } from 'react-window';
import isEqual from 'lodash.isequal';
import SearchInput from './SearchInput';
import ExpandableSection from './ExpandableSection';
import { getTabularData, getTabularDataItem } from '../../application/selectors/tabular';
import { TabularDefinition, TabularStateData } from '../../application/state/tabular';
import { setTabularExpanded, setTabularFilter, sortTabularBy } from '../../application/actions/tabular';
import { SortSecuence } from '../../application/state/sort';
import ItemText from './ItemText';
import { getTabularDefinition } from '../../application/helpers/tabular';
import { StreamRenderLayout } from '../../../stream/data';
import StreamViewLayout from '../stream/StreamViewLayout';
import { getStream } from '../../application/selectors/stream';

const FONT = '12px system-ui, sans-serif'
const FONT_BOLD = `bold ${FONT}`
const IMG_WIDTH = 26
const IMG_SORT_WIDTH = 18
const PLUS_WIDTH = 11 // ExpandablePlusButton
const ITEM_TEXT_PADDING = 5
const INPUT_WIDTH = 200
const INPUT_PADDING = 8
const SCROLL_BAR_WIDTH = 17
const LIST_TOTAL_HEIGHT = 610 // not multiple of ITEM_SIZE so it is visible there are more
const ITEM_HEIGHT = 20
const COLUMN_PADDING = 3

type RowValue =
    string |
    RowValue[] |
    { dispatch?: () => any, style?: any, visible?: boolean, width?: number, maxWidth?: number } & (
        { flex: number } |
        { img: string, title: string, show?: boolean } |
        { button: string } |
        { text: string } |
        { strong: string } |
        { input: string, dispatchChange: (value: string) => any } |
        RowValueLayout |
        { sub: RowValue[] } )

type RowValueLayout = { layout: StreamRenderLayout, layoutId: string, id: string, scale?: number }

const _getRowValueWidth = (v: RowValue, imgWidth: number = IMG_WIDTH): number[] => {
    const padding: number =
        typeof v === 'string' ? ITEM_TEXT_PADDING :
        (typeof v === 'object' ?
            ('text' in v || 'strong' in v ? ITEM_TEXT_PADDING :
            ('input' in v ? INPUT_PADDING :
            0)) : 0);

    let valueWidth: number[]
    if (typeof v === 'object' && 'width' in v) {
        valueWidth = [v.width]
    } else {
        valueWidth = v === undefined ? [] :
            (typeof v === 'string' ? [_getTextWidth(v, FONT_BOLD)] :
            (Array.isArray(v) ? v.map(sc => _getRowValueWidth(sc, imgWidth).reduce((acc, w) => acc + w, 0)) :
            ('flex' in v ? [0] :
            ('img' in v ? [imgWidth] :
            ('button' in v ? [_getTextWidth(v.button, FONT_BOLD)] :
            ('text' in v ? [_getTextWidth(v.text, FONT_BOLD)] :
            ('strong' in v ? [_getTextWidth(v.strong, FONT_BOLD)] :
            ('input' in v ? [INPUT_WIDTH] :
            ('layout' in v ? [0] :
            ('sub' in v ? _getRowValueWidth(v.sub, imgWidth) :
            []
        ))))))))));
        if (typeof v === 'object' && 'maxWidth' in v) {
            valueWidth = valueWidth.map(w => Math.min(w, v.maxWidth))
        }
    }
    return [ ...valueWidth, padding ]
};

const _RowValueRender = (p: {v: RowValue}): JSX.Element => {
    const { v } = p;
    const dispatch = useDispatch();
    const style = typeof v === 'object' && {
        ...'style' in v && v.style,
        ...'visible' in v && !v.visible && { visibility: 'hidden' }
    }
    if (style)
        delete style['justifyContent']
    const extra = typeof v === 'object' && {
        ...style && { style },
        ...'dispatch' in v && { onClick: (e) => { e.stopPropagation(); dispatch(v.dispatch()) }, className: 'pointer' },
    }

    return v === undefined ? <></> :
        (typeof v === 'string' ? <ItemText text={v} extra={extra} /> :
        (Array.isArray(v) ? <>{ v.map((w, i) => <_RowValueRender key={i} v={w} />) }</> :
        ('flex' in v ? <div style={{ flex: v.flex }} /> :
        ('img' in v ? <img src={v.img} title={v.title} {...v.show && { 'data-show': true }} {...extra} /> :
        ('button' in v ? <button {...extra}>{v.button}</button> :
        ('text' in v ? <ItemText text={v.text} extra={extra} /> :
        ('strong' in v ? <strong {...extra}>{v.strong}</strong> :
        ('input' in v ? <_Input value={v.input} width={v.width ?? INPUT_WIDTH} onChange={v.dispatchChange} /> :
        ('layout' in v ? <_Layout layout={v} /> :
        ('sub' in v ? <span {...extra}><_RowValueRender v={v.sub} /></span> :
        <></>
    ))))))))));
}

const _Layout = (p: { layout: RowValueLayout }): JSX.Element => {
    const { out: { data: { data } } } = useSelector(getStream)
    const { layout: v } = p
    return <StreamViewLayout single={{ data, layout: v.layout}} layoutId={v.layoutId} id={v.id} scale={v.scale} />
}

const _Input = (p: { value: string, width: number, onChange: (value: string) => any }): JSX.Element => {
    const dispatch = useDispatch()
    return <input
        type='text'
        value={p.value}
        style={{ width: p.width, font: FONT }}
        onClick={(e) => { e.stopPropagation() }}
        onChange={(e) => {
            e.stopPropagation();
            dispatch(p.onChange(e.target.value))
        }}
    />
}

function _getTextWidth(text: string, font: string): number {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
  
    if (context) {
      context.font = font;
      const metrics = context.measureText(text);
      return Math.ceil(metrics.width);
    }

    return 0;
}

const _getSortRow = (selector: string, columns: string[], sortSecuence?: SortSecuence): RowValue[] => columns.map((text, i) => ({
    dispatch: () => sortTabularBy(selector, i),
    style: { justifyContent: 'center' },
    sub: [
        { strong: text },
        { img: sortSecuence?.[0].ascending ? 'img/up.png' : 'img/down.png', title: sortSecuence?.[0].ascending ? 'Sorted Ascending' : 'Sorted Descending' },
    ]
}))

const _sum = (d: number[]): number => d.reduce((acc, n) => acc + n, 0)

const _calculateWidths = <TItem extends any>(items: TItem[], sortRow: RowValue[], getItemRow: (item: TItem, index: number) => RowValue[]): TableWidths => {
    const getSubColumnsWidth = (d: RowValue[], imgWidth: number): number[][] =>
        d.map(c => _getRowValueWidth(c, imgWidth));
    
    const addPadding = (padding: number, d: number[][]): number[][] =>
        d?.map((w, i) => i < d.length - 1 ? w.map(v => v + padding) : w)

    const itemsSubColumnsWidth = addPadding(COLUMN_PADDING, items.reduce((acc, item, index) => {
        const cw = getSubColumnsWidth(getItemRow(item, index), IMG_WIDTH)
        return acc ? acc.map((w, i) => {
            const maxLength = Math.max(w.length, cw[i].length)
            return Array.from({ length: maxLength }, (_, j) => Math.max(w[j] ?? 0, cw[i][j] ?? 0))
        }) : cw
    }, undefined as number[][]))

    const sortSubColumnsWidth = getSubColumnsWidth(sortRow, IMG_SORT_WIDTH)

    const columnsWidth: number[] = itemsSubColumnsWidth ?
        itemsSubColumnsWidth.map((w, i) => Math.max(_sum(w), _sum(sortSubColumnsWidth[i]))) :
        sortSubColumnsWidth.map(w => _sum(w))
    
    return {
        itemsSubColumns: itemsSubColumnsWidth,
        sortSubColumns: sortSubColumnsWidth,
        columns: columnsWidth
    }
}

interface TableWidths {
    itemsSubColumns: number[][],
    sortSubColumns: number[][],
    columns: number[],
}

interface TableParameters<TItem> {
    itemCount: number,
    width: TableWidths,
    sortRow: RowValue[],
    getItemRow: (item: TItem, index?: number) => RowValue[],
    itemSelector: (index: number) => (state: any) => TItem,
    itemHeight?: number
}

interface ColumnWidthData {
    width: number
    subWidth: number[]
}

// A custom hook to memoize deep comparisons
export function _useDeepCompareMemoize(value: any) {
    const ref = useRef<any>([]);

    if (!isEqual(value, ref.current)) {
        ref.current = value;
    }

    return ref.current;
}

function _getPadding(c: RowValue): number {
    return 0;
    /*if (!('style' in c)) return 0
    const paddingLeft = c.style?.paddingLeft ? parseInt(c.style.paddingLeft.toString()) : 0;
    const paddingRight = c.style?.paddingRight ? parseInt(c.style.paddingRight.toString()) : 0;
    return paddingLeft + paddingRight;*/
}

const _ItemRowRender = (p: {
    row: RowValue[],
    columns: ColumnWidthData[],
    height?: number,
}): JSX.Element => <>
    { p.columns.map((c: ColumnWidthData, i: number) => {
        const d = p.row[i]
        const height = p.height && { height: p.height };
        const justify = typeof d === 'object' && 'style' in d && d.style.justifyContent &&
            { justifyContent: d.style.justifyContent }
        return d && <div key={i} style={{ width: c.width - _getPadding(d), ...height, ...justify }}>
            <_RowValueRender v={d} />
        </div>
    })}
</>

const _ItemRow = <T extends any>(
    { index, style, getRow, itemSelector, columns, height } : {
    index: number;
    style: React.CSSProperties;
    getRow: (item: T, index?: number) => RowValue[];
    itemSelector: (index: number) => (state: any) => T;
    columns: ColumnWidthData[];
    height: number;
}) => {
    const item: T = useSelector(itemSelector(index));
    if (!item) return <p>{`Item ${index} not found`}</p>;

    const row = getRow(item, index);
    const className = 'item-row' + ('dispatch' in row ? ' pointer' : '');

    return (
        <div className={className} style={style}>
            <_ItemRowRender row={row} columns={columns} height={height} />
        </div>
    );
};

const _SortableFixedSizeTable = <TItem extends any>(p: {
    data: TableParameters<TItem>
}) => {
    const d = p.data
    let totalWidth = SCROLL_BAR_WIDTH + _sum(d.width.columns)
    if (totalWidth > window.innerWidth) {
        const extra = totalWidth - window.innerWidth
        //totalWidth = window.innerWidth
    }
    const itemHeight = d.itemHeight || ITEM_HEIGHT
    const totalHeight = Math.min(d.itemCount * itemHeight, LIST_TOTAL_HEIGHT)

    const getColumnsWidthData = (subWidths: number[][]): ColumnWidthData[] => subWidths.map((sw, i) => ({
        width: d.width.columns[i],
        subWidth: sw,
    }))

    const stableItemsSubColumnsWidth = _useDeepCompareMemoize(d.width.itemsSubColumns);
    const renderRow = useCallback(
        ({ index, style }: { index: number; style: React.CSSProperties }) => {
            return (
            <_ItemRow
                index={index}
                style={style}
                getRow={d.getItemRow}
                itemSelector={d.itemSelector}
                columns={getColumnsWidthData(stableItemsSubColumnsWidth)}
                height={itemHeight}
            />
        )}, [stableItemsSubColumnsWidth]);

    return (
        <div className='sort-table' style={{ font: FONT}}>
            <div className='sort-row'>
                <_ItemRowRender
                    row={d.sortRow}
                    columns={getColumnsWidthData(d.width.sortSubColumns)} />
            </div>
            <FixedSizeList
                height={totalHeight}
                itemCount={d.itemCount}
                itemSize={itemHeight}
                width={totalWidth}>
                {renderRow}
            </FixedSizeList>
        </div>
    )
}

const SortableFixedTable = <TItem extends any>(p: {
    selector: string,
    itemHeight?: number
}) => {
    const s: TabularStateData = useSelector(getTabularData(p.selector))
    if (!s?.items) return <p>{p.selector} is not loaded with items</p>

    const { selector, itemHeight } = p
    const { columns, getRow: getItemRow } = getTabularDefinition(selector)
    const sortRow = _getSortRow(selector, columns, s.sortSecuence)
    const table: TableParameters<TItem> = {
        width: _calculateWidths(s.items.all, sortRow, getItemRow),
        itemCount: s.items.show.length,
        sortRow,
        getItemRow,
        itemSelector: getTabularDataItem(selector),
        itemHeight
    }

    return <_SortableFixedSizeTable data={table} />
}

const SortableTable = (p: {
    selector: string,
}) => {
    const s: TabularStateData = useSelector(getTabularData(p.selector))
    if (!s?.items) return <p>{p.selector} is not loaded with items</p>

    const { selector } = p
    const { columns, getRow: getItemRow } = getTabularDefinition(selector)
    const sortRow = _getSortRow(selector, columns, s.sortSecuence)
    const width = _calculateWidths(s.items.all, sortRow, getItemRow)

    return <table className='sort-table' style={{ font: FONT}}>
        <thead>
            <tr>
                {sortRow.map((v, i) =>
                    <th key={i} className='sort-row' style={{ width: width.columns[i] }}>
                        <_RowValueRender v={v} />
                    </th>)}
            </tr>
        </thead>
        <tbody>
            {s.items.show.map((r, i) =>
                <tr key={i} className='item-row'>
                    {getItemRow(r, i).map((v, j) =>
                        <td key={j}>
                            <div><_RowValueRender v={v} /></div>
                        </td>)}
                </tr>
            )}
        </tbody>
    </table>
}

const SortableTabularSection = (p: {
    selector: string,
    afterSearch?: RowValue[],
    itemHeight?: number,
    useTable?: boolean
}) => {
    const { selector } = p
    const { title, columns, getRow }: TabularDefinition<any, any> = getTabularDefinition(selector)
    const s: TabularStateData = useSelector(getTabularData(selector))
    if (!s?.items) return <p>{selector} is not loaded with items</p>

    const stats = s.items.stats

    return <ExpandableSection title={title} expanded={s.expanded} setExpanded={setTabularExpanded(selector)}>
        <div className='search-container'>
            <p><span>{ stats.ped ? `Total value ${stats.ped} PED for` : 'Listing'}</span>
                <span> {stats.count} </span>
                <span> {stats.itemTypeName ?? 'item'}{stats.count == 1 ? '' : 's'}</span>
            </p>
            <p className='search-input-container'>
                <SearchInput filter={s.filter} setFilter={setTabularFilter(selector)} />
                { p.afterSearch && <_RowValueRender v={p.afterSearch} /> }
            </p>
        </div>
        {
            p.useTable ?
                <SortableTable selector={selector} /> :
                <SortableFixedTable selector={selector} itemHeight={p.itemHeight} />
                
        }
    </ExpandableSection>
}

export default SortableTabularSection
export {
    RowValue
}
