import React, { JSX } from 'react'
import { FONT, FONT_BOLD, IMG_WIDTH, INPUT_PADDING, INPUT_WIDTH, ITEM_TEXT_PADDING, RowValue, RowValueRender } from './SortableTabularSection.data'
import { useDispatch } from 'react-redux'
import ItemText from './ItemText'

const getRowValueWidth = (v: RowValue, imgWidth: number = IMG_WIDTH): number[] => {
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
            (Array.isArray(v) ? v.map(sc => getRowValueWidth(sc, imgWidth).reduce((acc, w) => acc + w, 0)) :
            ('flex' in v ? [0] :
            ('img' in v ? [imgWidth] :
            ('button' in v ? [_getTextWidth(v.button, FONT_BOLD)] :
            ('text' in v ? [_getTextWidth(v.text, FONT_BOLD)] :
            ('strong' in v ? [_getTextWidth(v.strong, FONT_BOLD)] :
            ('input' in v ? [INPUT_WIDTH] :
            ('layout' in v ? [0] :
            ('sub' in v ? getRowValueWidth(v.sub, imgWidth) :
            []
        ))))))))));
        if (typeof v === 'object' && 'maxWidth' in v) {
            valueWidth = valueWidth.map(w => Math.min(w, v.maxWidth))
        }
    }
    return [ ...valueWidth, padding ]
};

const BaseRowValueRender: RowValueRender = (p) => {
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
        (Array.isArray(v) ? <>{ v.map((w, i) => <BaseRowValueRender key={i} v={w} />) }</> :
        ('flex' in v ? <div style={{ flex: v.flex }} /> :
        ('img' in v ? <img src={v.img} title={v.title} {...v.show && { 'data-show': true }} {...extra} /> :
        ('button' in v ? <button {...extra}>{v.button}</button> :
        ('text' in v ? <ItemText text={v.text} extra={extra} /> :
        ('strong' in v ? <strong {...extra}>{v.strong}</strong> :
        ('input' in v ? <_Input value={v.input} width={v.width ?? INPUT_WIDTH} onChange={v.dispatchChange} /> :
        ('sub' in v ? <span {...extra}><BaseRowValueRender v={v.sub} /></span> :
        <></>
    )))))))));
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

export default BaseRowValueRender
export {
    getRowValueWidth,
}
