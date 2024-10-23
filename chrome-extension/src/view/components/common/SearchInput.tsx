import React from "react"
import { useDispatch } from "react-redux"
import ImgButton from "./ImgButton"

function SearchInput(p: {
    filter: string,
    setFilter: (v: string) => any
}) {
    const dispatch = useDispatch()

    return (
        <span className='search-input'>
            {p.filter && <ImgButton title='Clear filter' src='img/cross.png' dispatch={() => p.setFilter('')} />}
            <input type='text' className='form-control' placeholder='search' value={p.filter ?? ''} onChange={(e) => dispatch(p.setFilter(e.target.value))} />
        </span>
    )
}

export default SearchInput