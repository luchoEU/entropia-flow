import React, { CSSProperties } from 'react'

const ItemText = (p: {
    text: string
    className?: string
    style?: CSSProperties
}) => {
    return (
        <span
            {...p.style ? { style: p.style } : {}}
            className={(p.className ?? '') + ' item-text'}
        >
            { p.text }
        </span>
    )
}

export default ItemText