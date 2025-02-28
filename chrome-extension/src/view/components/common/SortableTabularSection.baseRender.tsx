import React, { JSX, useRef, useState } from 'react'
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
    } else if (typeof v === 'object' && 'maxWidth' in v) {
        valueWidth = [v.maxWidth]
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
            ('file' in v ? [IMG_WIDTH] :
            ('layout' in v ? [0] :
            ('sub' in v ? getRowValueWidth(v.sub, imgWidth) :
            []
        )))))))))));
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
        ...'visible' in v && !v.visible && { visibility: 'hidden' },
        ...'maxWidth' in v && v.maxWidth && { maxWidth: v.maxWidth },
        ...'sub' in v && { display: 'flex', width: '100%' }, // so flex works
    }
    if (style)
        delete style['justifyContent']
    const extra = typeof v === 'object' && {
        ...'class' in v && { className: v.class },
        ...'title' in v && { title: v.title },
        ...style && { style },
        ...'dispatch' in v && { onClick: (e) => { e.stopPropagation(); dispatch(v.dispatch()) }, className: 'pointer' },
    }

    return v === undefined ? <></> :
        (typeof v === 'string' ? <ItemText text={v} extra={extra} /> :
        (Array.isArray(v) ? <>{ v.map((w, i) => <BaseRowValueRender key={i} v={w} />) }</> :
        ('flex' in v ? <div style={{ flex: v.flex }} /> :
        ('img' in v ? <img src={v.img} {...v.show && { 'data-show': true }} {...extra} /> :
        ('button' in v ? <button {...extra}>{v.button}</button> :
        ('text' in v ? <ItemText text={v.text} extra={extra} /> :
        ('strong' in v ? <strong {...extra}>{v.strong}</strong> :
        ('input' in v ? <_Input value={v.input} width={v.width ?? INPUT_WIDTH} dispatchChange={v.dispatchChange} /> :
        ('file' in v ? <_File value={v.file} dispatchChange={v.dispatchChange} /> :
        ('sub' in v ? <div {...extra}><BaseRowValueRender v={v.sub} /></div> :
        <></>
    ))))))))));
}

const _Input = (p: { value: string, width: number, dispatchChange: (value: string) => any }): JSX.Element => {
    const dispatch = useDispatch()
    const [ text, setText ] = useState(p.value); // don't use p.value directly to avoid losing the cursor position

    return <input
        type='text'
        value={text}
        style={{ width: p.width, font: FONT }}
        onClick={(e) => { e.stopPropagation() }}
        onChange={(e) => {
            e.stopPropagation();
            setText(e.target.value)
            dispatch(p.dispatchChange(e.target.value))
        }}
    />
}

const _File = (p: { value: string, dispatchChange: (value: string) => any }): JSX.Element => {
    const dispatch = useDispatch()
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleButtonClick = () => {
      fileInputRef.current?.click(); // Programmatically trigger the file input click
    };
  
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]; // Get the selected file
      if (file) {
        const reader = new FileReader();
  
        reader.onload = (e) => {
            dispatch(p.dispatchChange(e.target?.result as string))
        };
  
        reader.onerror = (err) => {
          console.error("Error reading file:", err);
          dispatch(p.dispatchChange(null));
        };
  
        reader.readAsDataURL(file);
      }
    };
  
    return (
      <div>
        <input type="file" accept="*" style={{ display: "none" }} ref={fileInputRef} onChange={handleFileChange} />
        <img src={p.value} alt="Choose File" onClick={handleButtonClick} className='pointer' />
      </div>
    );
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
