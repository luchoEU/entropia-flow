import React from 'react'
import { useDispatch } from "react-redux"

const SortableTable = (p: {
    sortType: number,
    sortBy: (part: number) => any,
    columns: number[],
    definition: { [part: number]: { text: string, up: number, down: number} },
    children: any
}) => {
    const { sortType, sortBy, columns, definition, children } = p
    const dispatch = useDispatch()

    return (
        <table className='table-diff table-diff-row'>
            <thead>
                <tr className='sort-row'>
                    { columns.map((c) =>
                        <th onClick={() => dispatch(sortBy(c))}>
                            <strong>{definition[c].text} </strong>
                            { sortType === definition[c].up && <img src='img/up.png' /> }
                            { sortType === definition[c].down && <img src='img/down.png' /> }
                        </th>
                    )}
                </tr>
            </thead>
            <tbody>
                { children }
            </tbody>
        </table>
    )
}

export default SortableTable