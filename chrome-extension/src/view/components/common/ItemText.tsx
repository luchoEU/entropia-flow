import React from 'react'

const ItemText = (p: {
    text: string
    className?: string
}) => {
    return (
        <span className={(p.className ?? '') + ' item-text'} data-text={p.text}>
            { p.text }
        </span>
    )
}

export default ItemText