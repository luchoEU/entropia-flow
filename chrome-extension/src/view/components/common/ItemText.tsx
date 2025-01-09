import React, { CSSProperties } from 'react'

const ItemText = (p: {
    text: string
    className?: string
    style?: CSSProperties
    extra?: object
}) => {
    return (
        <span
            {...p.style ? { style: p.style } : {}}
            className={(p.className ?? '') + ' item-text'}
            title={p.text}
            {...p.extra}
        >
            { p.text }
        </span>
    )
}

export default ItemText