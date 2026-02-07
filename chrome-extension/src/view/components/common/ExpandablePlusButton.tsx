import React from "react"

const ExpandablePlusButton = (p: {
    expanded?: boolean,
    setExpanded: (expanded: boolean) => any,
    className?: string
}) => {
    const handleClick = (expanded: boolean) => (e: React.MouseEvent) => {
        e.stopPropagation()
        const result = p.setExpanded(expanded)
        // Support Jotai setters (which return Promise/void)
        if (result instanceof Promise) {
            result.catch(err => console.error('Expand error:', err))
        }
    }

    const className = (p.className ?? '') + ' button-plus'
    return p.expanded === undefined ?
        <span className={className}></span> :
        (p.expanded ?
            <span className={className} onClick={handleClick(false)}>▼</span> :
            <span className={className} onClick={handleClick(true)}>▶</span>)
}

export default ExpandablePlusButton