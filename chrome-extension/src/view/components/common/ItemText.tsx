import React from 'react'

const ItemText = (p: {
    text: string
}) => {
    return (
        <span className='item-text' data-text={p.text}>
            { p.text }
        </span>
    )
}

export default ItemText