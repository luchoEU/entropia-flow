import React from 'react'
import { useDispatch } from "react-redux"

const SortableTable = (p: {
    sortType: number,
    sortBy: (part: number) => any,
    columns: number[],
    nameOverride?: { [part: number]: string },
    definition: { [part: number]: { text: string, up: number, down: number} },
    children: any
}) => {
    const { sortType, sortBy, columns, nameOverride, definition, children } = p
    const dispatch = useDispatch()

    return (
        <table className='table-diff table-diff-row'>
            <thead>
                <tr className='sort-row'>
                    { columns.map((c) =>
                        c < 0 ? <th></th> :
                        <th onClick={() => dispatch(sortBy(c))}>
                            <strong>{(nameOverride ? nameOverride[c] : undefined) ?? definition[c].text} </strong>
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