import React from "react"
import ExpandableArrowButton from "./ExpandableArrowButton"

const ExpandableSection = (p: {
    title: string,
    expanded: boolean,
    setExpanded: (expanded: boolean) => any,
    block?: boolean,
    children: any
}) => {
    return (
        <section {...(p.block ? { className: 'block' } : {})}>
            <h1>{p.title} <ExpandableArrowButton expanded={p.expanded} setExpanded={p.setExpanded} />
            </h1>
            {
                p.expanded ? p.children : ''
            }
        </section>
    )
}

export default ExpandableSection