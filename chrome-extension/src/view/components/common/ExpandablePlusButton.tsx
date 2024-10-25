import React from "react"
import { useDispatch } from "react-redux"

const ExpandablePlusButton = (p: {
    expanded?: boolean,
    setExpanded: (expanded: boolean) => any,
    className?: string
}) => {
    const dispatch = useDispatch()

    const className = (p.className ?? '') + ' button-plus'
    return p.expanded === undefined ?
        <span className={className}></span> :
        (p.expanded ?
            <span className={className} onClick={(e) => {
                e.stopPropagation()
                dispatch(p.setExpanded(false))
            }}>-</span> :
            <span className={className} onClick={(e) => {
                e.stopPropagation()
                dispatch(p.setExpanded(true))
            }}>+</span>)
}

export default ExpandablePlusButton