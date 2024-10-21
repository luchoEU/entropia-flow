import React from "react"
import { useDispatch } from "react-redux"

function SearchInput(p: {
    filter: string,
    setFilter: (v: string) => any
}) {
    const dispatch = useDispatch()

    return (
        <span className='search-input'>
            {p.filter && <img src='img/cross.png' onClick={(e) => dispatch(p.setFilter(''))} />}
            <input type='text' className='form-control' placeholder='search' value={p.filter ?? ''} onChange={(e) => dispatch(p.setFilter(e.target.value))} />
        </span>
    )
}

export default SearchInput