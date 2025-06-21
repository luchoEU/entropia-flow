import React, { JSX, useCallback, useRef } from 'react'
import { useSelector } from "react-redux"
import { FixedSizeList } from 'react-window';
import isEqual from 'lodash.isequal';
import SearchInput from './SearchInput';
import ExpandableSection from './ExpandableSection2';
import { getTabularData, getTabularDataItem } from '../../application/selectors/tabular';
import { TabularDefinition, TabularStateData } from '../../application/state/tabular';
import { setTabularFilter, sortTabularBy } from '../../application/actions/tabular';
import { SortSecuence } from '../../application/state/sort';
import { getTabularDefinition } from '../../application/helpers/tabular';
import { COLUMN_PADDING, FONT, IMG_SORT_WIDTH, IMG_WIDTH, ITEM_HEIGHT, LIST_TOTAL_HEIGHT, RowValue, RowValueRender, SCROLL_BAR_WIDTH } from './SortableTabularSection.data';
import BaseRowValueRender, { getRowValueWidth } from './SortableTabularSection.baseRender';

const _getSortRow = (selector: string, columns: string[], columnHeaderAfterName?: RowValue[], sortSecuence?: SortSecuence): RowValue[] => columns.map((text, i) => ({
    dispatch: () => sortTabularBy(selector, i),
    style: { justifyContent: 'center' },
    sub: [
        { strong: text },
        {
            img: sortSecuence?.[0].ascending ? 'img/up.png' : 'img/down.png',
            title: sortSecuence?.[0].ascending ? 'Sorted Ascending' : 'Sorted Descending',
            visible: sortSecuence?.[0].column === i
        },
        columnHeaderAfterName?.[i]
    ]
}))

const _sum = (d: number[]): number => d.reduce((acc, n) => acc + n, 0)

const _calculateWidths = <TItem extends any>(items: TItem[], sortRow: RowValue[], getItemRow: (item: TItem, index: number) => RowValue[]): TableWidths => {
    const getSubColumnsWidth = (d: RowValue[], imgWidth: number): number[][] =>
        d.map(c => getRowValueWidth(c, imgWidth));
    
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
    getRowClass: (item: TItem, index?: number) => string | undefined,
    itemSelector: (index: number) => (state: any) => TItem,
    itemHeight?: number,
    rowValueRender: RowValueRender
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
    rowValueRender: RowValueRender
}): JSX.Element => <>
    { p.columns.map((c: ColumnWidthData, i: number) => {
        const { rowValueRender: RowValueRenderComponent } = p
        const d = p.row[i]
        const height = p.height && { height: p.height };
        const justify = typeof d === 'object' && 'style' in d && d.style.justifyContent &&
            { justifyContent: d.style.justifyContent }
        return <div key={i} style={{ width: c.width - _getPadding(d), ...height, ...justify }}>
            <RowValueRenderComponent v={d} />
        </div>
    })}
</>

const _ItemRow = <T extends any>(
    { index, style, getRow, getRowClass, itemSelector, columns, height, rowValueRender } : {
    index: number;
    style: React.CSSProperties;
    getRow: (item: T, index?: number) => RowValue[];
    getRowClass: (item: T, index?: number) => string | undefined;
    itemSelector: (index: number) => (state: any) => T;
    columns: ColumnWidthData[];
    height: number;
    rowValueRender: RowValueRender;
}) => {
    const item: T = useSelector(itemSelector(index));
    if (!item) return <p>{`Item ${index} not found`}</p>;

    const row = getRow(item, index);
    let className = 'item-row' + ('dispatch' in row ? ' pointer' : '');
    const rowClass = getRowClass?.(item, index);
    if (rowClass) className += ` ${rowClass}`

    return (
        <div className={className} style={style}>
            <_ItemRowRender row={row} columns={columns} height={height} rowValueRender={rowValueRender} />
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
        ({ index, style }: { index: number; style: React.CSSProperties }) => 
            <_ItemRow
                index={index}
                style={style}
                getRow={d.getItemRow}
                getRowClass={d.getRowClass}
                itemSelector={d.itemSelector}
                columns={getColumnsWidthData(stableItemsSubColumnsWidth)}
                height={itemHeight}
                rowValueRender={d.rowValueRender}
            />, [stableItemsSubColumnsWidth]);

    return (
        <div className='sort-table' style={{ font: FONT }}>
            <div className='sort-row'>
                <_ItemRowRender
                    row={d.sortRow}
                    columns={getColumnsWidthData(d.width.sortSubColumns)}
                    rowValueRender={d.rowValueRender}
                />
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

const SortableFixedTable = <TItem extends any>({ selector, rowValueRender, useWidthFromAll, itemHeight }: {
    selector: string
    rowValueRender: RowValueRender
    useWidthFromAll?: boolean
    itemHeight?: number
}) => {
    const s: TabularStateData = useSelector(getTabularData(selector))
    if (!s?.items) return <p>{selector} is not loaded with items</p>

    const { columns, columnHeaderAfterName, getRow: getItemRow, getRowClass } = getTabularDefinition(selector, s.items?.show, s.data)
    const sortRow = _getSortRow(selector, columns, columnHeaderAfterName?.(s.data), s.sortSecuence)
    const table: TableParameters<TItem> = {
        width: _calculateWidths(useWidthFromAll ? s.items.all : s.items.show, sortRow, getItemRow),
        itemCount: s.items.show.length,
        sortRow,
        getItemRow,
        getRowClass,
        itemSelector: getTabularDataItem(selector),
        itemHeight,
        rowValueRender
    }

    return <_SortableFixedSizeTable data={table} />
}

const SortableTable = ({ selector, rowValueRender, useWidthFromAll }: {
    selector: string,
    rowValueRender: RowValueRender,
    useWidthFromAll?: boolean
}) => {
    const s: TabularStateData = useSelector(getTabularData(selector))
    if (!s?.items) return <p>{selector} is not loaded with items</p>

    const RowValueRenderComponent = rowValueRender
    const { columns, columnHeaderAfterName, getRow: getItemRow } = getTabularDefinition(selector, s.items?.show, s.data)
    const sortRow = _getSortRow(selector, columns, columnHeaderAfterName?.(s.data), s.sortSecuence)
    const width = _calculateWidths(useWidthFromAll ? s.items.all : s.items.show, sortRow, getItemRow)

    return <div style={{ maxHeight: LIST_TOTAL_HEIGHT, overflowX: 'hidden', overflowY: 'auto' }}>
        <table className='sort-table' style={{ font: FONT }}>
            <thead>
                <tr>
                    {sortRow.map((v, i) =>
                        <th key={i} className='sort-row' style={{ width: width.columns[i] }}>
                            <RowValueRenderComponent v={v} />
                        </th>)}
                </tr>
            </thead>
            <tbody>
                {s.items.show.map((r, i) =>
                    <tr key={i} className='item-row'>
                        {getItemRow(r, i).map((v, j) =>
                            <td key={j}>
                                <div><RowValueRenderComponent v={v} /></div>
                            </td>)}
                    </tr>
                )}
            </tbody>
        </table>
    </div>
}

const SortableTabularSection = ({
    selector,
    afterSearch,
    beforeTable,
    itemHeight,
    useTable,
    rowValueRender,
    useWidthFromAll,
    children
}: {
    selector: string,
    afterSearch?: RowValue[],
    beforeTable?: RowValue[],
    itemHeight?: number,
    useTable?: boolean,
    rowValueRender?: RowValueRender,
    useWidthFromAll?: boolean,
    children?: any
}) => {
    const RowValueRenderComponent = rowValueRender ?? BaseRowValueRender
    const definition: TabularDefinition<any, any> = getTabularDefinition(selector, undefined, undefined)
    const s: TabularStateData = useSelector(getTabularData(selector))

    if (!definition) return <p>{selector} is not defined</p>
    if (!s?.items) return <p>{selector} is not loaded with items</p>

    const { title, subtitle } = definition
    const stats = s.items.stats

    return <ExpandableSection selector={`TabularSection.${selector}`} title={title} subtitle={subtitle}>
        <div className='inline'>
            <div className='search-container'>
                <p><span>{ stats.ped ? `Total value ${stats.ped} PED for` : 'Listing'}</span>
                    <span> {stats.count} </span>
                    <span> {definition.itemTypeName ?? 'item'}{stats.count == 1 ? '' : 's'}</span>
                </p>
                <p className='search-input-container'>
                    <SearchInput filter={s.filter} setFilter={setTabularFilter(selector)} />
                    { afterSearch && <RowValueRenderComponent v={afterSearch} /> }
                </p>
            </div>
            { beforeTable && <div className='sortable-before-table'><RowValueRenderComponent v={beforeTable} /></div> }
            {
                useTable ?
                    <SortableTable selector={selector} rowValueRender={RowValueRenderComponent} useWidthFromAll={useWidthFromAll} /> :
                    <SortableFixedTable selector={selector} itemHeight={itemHeight} rowValueRender={RowValueRenderComponent} useWidthFromAll={useWidthFromAll} />
            }
        </div>
        <div className='inline'>
            { children }
        </div>
    </ExpandableSection>
}

export default SortableTabularSection
