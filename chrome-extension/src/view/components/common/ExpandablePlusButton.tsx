import React from "react"
import { useDispatch } from "react-redux"

const ExpandablePlusButton = (p: {
    expanded?: boolean,
    setExpanded: (expanded: boolean) => any,
    className?: string
}) => {
    const dispatch = useDispatch()

    const handleClick = (expanded: boolean) => (e: React.MouseEvent) => {
        e.stopPropagation()
        const result = p.setExpanded(expanded)
        // Support both Redux actions and Jotai setters (which return Promise/void)
        if (result && typeof result.type === 'string') {
            dispatch(result)
        }
    }

    const className = (p.className ?? '') + ' button-plus'
    return p.expanded === undefined ?
        <span className={className}></span> :
        (p.expanded ?
            <span className={className} onClick={handleClick(false)}>-</span> :
            <span className={className} onClick={handleClick(true)}>+</span>)
}

export default ExpandablePlusButton