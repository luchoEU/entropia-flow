import React from "react"
import { useDispatch } from "react-redux"

const ExpandablePlusButton = (p: {
    expanded?: boolean,
    setExpanded: (expanded: boolean) => any,
}) => {
    const dispatch = useDispatch()

    return p.expanded === undefined ?
        <span className='button-plus'></span> :
        (p.expanded ?
            <span className='button-plus' onClick={(e) => {
                e.stopPropagation()
                dispatch(p.setExpanded(false))
            }}>-</span> :
            <span className='button-plus' onClick={(e) => {
                e.stopPropagation()
                dispatch(p.setExpanded(true))
            }}>+</span>)
}

export default ExpandablePlusButton