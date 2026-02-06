import React from "react"
import ImgButton from "./ImgButton"

function SearchInput(p: {
    filter: string,
    setFilter: (v: string) => any
}) {
    const handleChange = (value: string) => {
        const result = p.setFilter(value)
        if (result instanceof Promise) {
            result.catch(err => console.error('Filter change error:', err))
        }
    }

    return (
        <span className='search-input'>
            {p.filter && <ImgButton title='Clear filter' src='img/cross.png' dispatch={() => { handleChange(''); return true }} />}
            <input type='text' className='form-control' placeholder='search' value={p.filter ?? ''} onChange={(e) => handleChange(e.target.value)} />
        </span>
    )
}

export default SearchInput